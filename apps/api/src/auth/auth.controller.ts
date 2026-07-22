import {
  Controller,
  Post,
  Body,
  Get,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  SetMetadata,
  NotImplementedException,
} from "@nestjs/common";
import { Response, Request } from "express";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RolesGuard } from "./roles.guard";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ApproveUserDto } from "./dto/approve-user.dto";
import { UserRole } from "./entities/user.entity";

export const ROLES_KEY = "roles";

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

@Controller("v1/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);

    if (!user.approved_at) {
      return {
        message: "Registration successful. Please wait for admin approval.",
        approved: false,
      };
    }

    return {
      message: "Registration successful.",
      approved: true,
      user,
    };
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);

    // Set HttpOnly cookies
    response.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    response.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      user: result.user,
    };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies.refreshToken;

    if (refreshToken) {
      try {
        const payload = await this.authService.verifyRefreshToken(refreshToken);
        await this.authService.deleteAllRefreshTokens(payload.sub);
      } catch (error) {
        // Ignore errors during logout
      }
    }

    // Clear cookies
    response.clearCookie("accessToken");
    response.clearCookie("refreshToken");

    return { message: "Logged out successfully" };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async me(@Req() request: RequestWithUser) {
    const user = request.user;
    const userDetails = await this.authService.getUserById(user.userId);

    if (!userDetails) {
      throw new NotImplementedException("User not found");
    }

    return userDetails;
  }

  @Post("approve-user")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata(ROLES_KEY, [UserRole.SUPER_ADMIN])
  @HttpCode(HttpStatus.OK)
  async approveUser(@Body() approveUserDto: ApproveUserDto) {
    const user = await this.authService.approveUser(approveUserDto.email);
    return {
      message: "User approved successfully",
      user,
    };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies.refreshToken;

    if (!refreshToken) {
      throw new NotImplementedException("No refresh token provided");
    }

    const payload = await this.authService.verifyRefreshToken(refreshToken);
    const result = await this.authService.rotateRefreshToken(
      refreshToken,
      payload.sub,
    );

    // Set new HttpOnly cookies
    response.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    response.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      user: result.user,
    };
  }

  @Post("mfa/verify")
  @HttpCode(HttpStatus.OK)
  async verifyMfa() {
    // Stub implementation for TOTP admin elevation
    throw new NotImplementedException(
      "AuthController: mfa/verify is not implemented yet.",
    );
  }
}
