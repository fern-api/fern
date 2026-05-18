import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         amount: 1,
 *         currency: "USD"
 *     }
 */
export interface CreatePaymentRequest {
    amount: number;
    currency: SeedApi.idempotencyHeaders.Currency;
}
