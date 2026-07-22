import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { Pool } from "pg";
import { Inject } from "@nestjs/common";
import { DATABASE_POOL } from "../database/tokens";
import {
  User,
  UserRole,
  CreateUserDto,
  LoginDto,
} from "./entities/user.entity";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // Fail fast if JWT_SECRET is not configured
    if (!this.configService.get<string>("JWT_SECRET")) {
      throw new Error("JWT_SECRET environment variable is not set");
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async generateTokens(userId: string, email: string, role: UserRole) {
    const payload = { sub: userId, email, role };

    const jwtSecret = this.configService.get<string>("JWT_SECRET");
    const jwtRefreshSecret =
      this.configService.get<string>("JWT_REFRESH_SECRET") || jwtSecret;

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: "15m",
      secret: jwtSecret,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: "7d",
      secret: jwtRefreshSecret,
    });

    return { accessToken, refreshToken };
  }

  // Use deterministic SHA-256 hash for token lookup (not bcrypt due to salt)
  async hashRefreshToken(token: string): Promise<string> {
    const secret =
      this.configService.get<string>("JWT_REFRESH_SECRET") ||
      this.configService.get<string>("JWT_SECRET");
    return crypto.createHmac("sha256", secret).update(token).digest("hex");
  }

  async verifyRefreshToken(token: string): Promise<any> {
    const jwtRefreshSecret =
      this.configService.get<string>("JWT_REFRESH_SECRET") ||
      this.configService.get<string>("JWT_SECRET");

    try {
      const payload = this.jwtService.verify(token, {
        secret: jwtRefreshSecret,
      });

      // Check if token exists in database (not revoked)
      const tokenHash = await this.hashRefreshToken(token);
      const result = await this.pool.query(
        "SELECT user_id, expires_at FROM refresh_tokens WHERE token_hash = $1 AND expires_at > NOW()",
        [tokenHash],
      );

      if (result.rows.length === 0) {
        throw new UnauthorizedException("Refresh token not found or expired");
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async register(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, role = UserRole.USER } = createUserDto;

    // Check if user already exists
    const existingUser = await this.pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      throw new ConflictException("User already exists");
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create user with approved_at = null (pending approval)
    const result = await this.pool.query(
      `INSERT INTO users (email, password_hash, role, approved_at) 
       VALUES ($1, $2, $3, NULL) 
       RETURNING id, email, role, approved_at, created_at, updated_at`,
      [email, passwordHash, role],
    );

    return result.rows[0];
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const result = await this.pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    const isPasswordValid = await this.comparePasswords(
      password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      return null;
    }

    // Check if user is approved
    if (!user.approved_at) {
      throw new UnauthorizedException("Email not approved by admin");
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      approved_at: user.approved_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Store refresh token in database
    const refreshTokenHash = await this.hashRefreshToken(tokens.refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) 
       VALUES ($1, $2, $3)`,
      [user.id, refreshTokenHash, expiresAt],
    );

    return {
      user,
      ...tokens,
    };
  }

  async getUserById(userId: string): Promise<User | null> {
    const result = await this.pool.query(
      "SELECT id, email, role, approved_at, created_at, updated_at FROM users WHERE id = $1",
      [userId],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  async approveUser(email: string): Promise<User> {
    const result = await this.pool.query(
      `UPDATE users 
       SET approved_at = CURRENT_TIMESTAMP 
       WHERE email = $1 
       RETURNING id, email, role, approved_at, created_at, updated_at`,
      [email],
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedException("User not found");
    }

    return result.rows[0];
  }

  async deleteRefreshToken(tokenHash: string): Promise<void> {
    await this.pool.query("DELETE FROM refresh_tokens WHERE token_hash = $1", [
      tokenHash,
    ]);
  }

  async deleteAllRefreshTokens(userId: string): Promise<void> {
    await this.pool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [
      userId,
    ]);
  }

  async rotateRefreshToken(oldToken: string, userId: string) {
    // Delete old refresh token by user ID (safer than hash matching)
    await this.deleteAllRefreshTokens(userId);

    // Get user
    const user = await this.getUserById(userId);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Generate new tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Store new refresh token
    const newRefreshTokenHash = await this.hashRefreshToken(
      tokens.refreshToken,
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) 
       VALUES ($1, $2, $3)`,
      [user.id, newRefreshTokenHash, expiresAt],
    );

    return {
      user,
      ...tokens,
    };
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;

    try {
      const payload = await this.verifyRefreshToken(refreshToken);
      await this.deleteAllRefreshTokens(payload.sub);
    } catch (error) {
      // Best-effort logout: do not fail the response, but log for observability
      this.logger.warn(
        `Logout error for refresh token; proceeding with best-effort logout.`,
      );
      this.logger.debug(
        `Logout stack trace: ${
          error instanceof Error
            ? (error.stack ?? error.message)
            : String(error)
        }`,
      );
    }
  }
}
