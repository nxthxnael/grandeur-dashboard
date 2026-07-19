import { Controller, Post, Get, Body, Param, NotImplementedException } from '@nestjs/common';

@Controller('v1/points')
export class PointsController {

  @Get('balance/:memberId')
  async getBalance(@Param('memberId') memberId: string) {
    // Stub to fetch total, locked, and redeemable points (3-figure balances)
    throw new NotImplementedException('PointsController: getBalance is not implemented yet.');
  }

  @Post('redeem')
  async redeem(@Body() body: any) {
    // Stub for point redemptions (airtime, MPESA cash, merchandise)
    // Guards with POINTS_LOCKED_FOR_PREMIUM logic
    throw new NotImplementedException('PointsController: redeem is not implemented yet.');
  }

  @Post('transfer')
  async transfer(@Body() body: any) {
    // Stub for within-domain only points transfer
    throw new NotImplementedException('PointsController: transfer is not implemented yet.');
  }
}
