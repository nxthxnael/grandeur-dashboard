import { Injectable } from '@nestjs/common';

@Injectable()
export class FcfsResolverService {
  /**
   * Resolves the referral target member using FCFS oldest-first tree traversal.
   * If the owner member has < 3 direct descendants, returns the owner member.
   * Otherwise, runs BFS down the member tree to find the oldest sub-member 
   * (depth 1 to 4) who has < 3 direct slots filled.
   * 
   * Uses the closure table for iterative, depth-by-depth loading (preventing recursive CTEs).
   * 
   * @param referrerMemberId The ID of the member whose link was shared.
   * @returns The resolved descendant member ID who will receive the new signup.
   */
  async resolveReferralTarget(
    referrerMemberId: string,
    queryDb: (sql: string, params: any[]) => Promise<any[]>
  ): Promise<string> {
    console.log(`[FCFS] Starting slot resolution for referrer: ${referrerMemberId}`);

    // Step 1: Check direct slots of referrer (depth 1)
    const directChildren = await queryDb(
      `SELECT descendant_id FROM member_tree mt 
       JOIN members m ON m.id = mt.descendant_id
       WHERE mt.ancestor_id = $1 AND mt.depth = 1 
       ORDER BY m.registered_at ASC`,
      [referrerMemberId]
    );

    if (directChildren.length < 3) {
      console.log(`[FCFS] Referrer has available direct slots (${directChildren.length}/3). Assigning directly.`);
      return referrerMemberId;
    }

    // Step 2: Traverse downwards level-by-level (BFS depth 1 to 4)
    // directChildren is our initial queue for depth 1
    let queue = directChildren.map(c => c.descendant_id);

    for (let depth = 1; depth <= 4; depth++) {
      const nextLevelQueue: string[] = [];

      for (const candidateId of queue) {
        // Count descendants for this candidate
        const slotsUsed = await queryDb(
          `SELECT COUNT(*) as count FROM member_tree WHERE ancestor_id = $1 AND depth = 1`,
          [candidateId]
        );
        const count = parseInt(slotsUsed[0]?.count || '0', 10);

        if (count < 3) {
          console.log(`[FCFS] Resolved target under sub-member ${candidateId} at depth ${depth} (${count}/3 slots filled).`);
          return candidateId;
        }

        // Load grandchildren for next depth iteration (ordered oldest-first)
        const children = await queryDb(
          `SELECT descendant_id FROM member_tree mt
           JOIN members m ON m.id = mt.descendant_id
           WHERE mt.ancestor_id = $1 AND mt.depth = 1
           ORDER BY m.registered_at ASC`,
          [candidateId]
        );
        nextLevelQueue.push(...children.map(c => c.descendant_id));
      }

      queue = nextLevelQueue;
      if (queue.length === 0) break;
    }

    // Fallback if full tree levels 1-4 are completely saturated
    console.warn(`[FCFS] All slots saturated up to depth 4 for referrer ${referrerMemberId}. Defaulting to referrer.`);
    return referrerMemberId;
  }
}
