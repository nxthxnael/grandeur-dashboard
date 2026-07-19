import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class PointsLockService {
  /**
   * Calculates the locked and redeemable portion of a member's points wallet.
   * If the domain has points_lock_enabled = true (e.g. Insurance):
   *   - Points up to the lock threshold are locked to cover premium obligations.
   *   - Only points exceeding the lock threshold are redeemable.
   * 
   * @param totalGlp The total loyalty points in KES hundredths.
   * @param lockThreshold The active premium lock threshold in KES hundredths.
   * @param pointsLockEnabled Whether the domain requires premium lock protection.
   */
  calculateBalances(totalGlp: number, lockThreshold: number, pointsLockEnabled: boolean) {
    if (!pointsLockEnabled) {
      return {
        totalGlp,
        lockedGlp: 0,
        redeemableGlp: totalGlp
      };
    }

    // Points up to the lock threshold are locked; points above are redeemable.
    const lockedGlp = Math.min(totalGlp, lockThreshold);
    const redeemableGlp = Math.max(0, totalGlp - lockThreshold);

    return {
      totalGlp,
      lockedGlp,
      redeemableGlp
    };
  }

  /**
   * Asserts that a member has sufficient redeemable points to cover a redemption.
   * Throws POINTS_LOCKED_FOR_PREMIUM exception if request exceeds redeemable amount.
   * 
   * @param requestedAmount Points requested to redeem in KES hundredths.
   * @param redeemableGlp Available redeemable points in KES hundredths.
   */
  assertRedeemable(requestedAmount: number, redeemableGlp: number) {
    if (requestedAmount > redeemableGlp) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'POINTS_LOCKED_FOR_PREMIUM',
        message: `Redemption of ${requestedAmount} points rejected. Points are locked to cover premium obligation. Redeemable balance is ${redeemableGlp} points.`
      });
    }
  }
}
