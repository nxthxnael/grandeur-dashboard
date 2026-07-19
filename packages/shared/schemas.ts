import { z } from 'zod';

export const SaleWebhookSchema = z.object({
  domainSlug: z.string(),
  memberId: z.string().uuid(),
  amountCents: z.number().int().positive(), // in KES hundredths
  transactionId: z.string(),
  signature: z.string(), // HMAC verification signature
  timestamp: z.string().datetime()
});

export const PointRedemptionSchema = z.object({
  memberId: z.string().uuid(),
  domainSlug: z.string(),
  redemptionType: z.enum(['airtime', 'mpesa_cash', 'merchandise', 'discount']),
  amountCents: z.number().int().positive(), // in KES hundredths
  recipientDetail: z.string() // phone number for airtime/cash, address for merchandise
});

export const DomainConfigSchema = z.object({
  slug: z.string().min(2).max(50),
  name: z.string().min(2).max(100),
  tierContributing: z.boolean().default(false),
  pointsLockEnabled: z.boolean().default(false),
  hmacSecret: z.string().min(32)
});

export type SaleWebhook = z.infer<typeof SaleWebhookSchema>;
export type PointRedemption = z.infer<typeof PointRedemptionSchema>;
export type DomainConfig = z.infer<typeof DomainConfigSchema>;
