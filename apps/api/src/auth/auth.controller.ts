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
  NotImplementedException,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RolesGuard } from "./roles.guard";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ApproveUserDto } from "./dto/approve-user.dto";
import { UserRole } from "./entities/user.entity";
import { RequestWithUser } from "./auth.types";
import { Roles } from "./roles.decorator";
import { setAuthCookies, clearAuthCookies } from "./auth.cookies";

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

    setAuthCookies(response, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
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
    await this.authService.logout(request.cookies.refreshToken);

    clearAuthCookies(response);

    return { message: "Logged out successfully" };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async me(@Req() request: RequestWithUser) {
    const user = request.user;
    const userDetails = await this.authService.getUserById(user.userId);

    if (!userDetails) {
      throw new NotFoundException("User not found");
    }

    return userDetails;
  }

  @Post("approve-user")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
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
      throw new UnauthorizedException("No refresh token provided");
    }

    const payload = await this.authService.verifyRefreshToken(refreshToken);
    const result = await this.authService.rotateRefreshToken(
      refreshToken,
      payload.sub,
    );

    setAuthCookies(response, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
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
