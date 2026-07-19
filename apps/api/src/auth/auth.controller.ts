import { Controller, Post, Body, Res, HttpCode, HttpStatus, NotImplementedException } from '@nestjs/common';

@Controller('v1/auth')
export class AuthController {
  
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: any) {
    // Stub implementation for SAS-001 §6
    // Expected payload: { phone: string, deviceHash?: string }
    throw new NotImplementedException('AuthController: register is not implemented yet.');
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: any, @Res({ passthrough: true }) response: any) {
    // Stub implementation for JWT + HttpOnly refresh cookie rotation
    throw new NotImplementedException('AuthController: login is not implemented yet.');
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh() {
    // Stub implementation for theft-detection cookie rotation
    throw new NotImplementedException('AuthController: refresh is not implemented yet.');
  }

  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  async verifyMfa() {
    // Stub implementation for TOTP admin elevation
    throw new NotImplementedException('AuthController: mfa/verify is not implemented yet.');
  }
}
