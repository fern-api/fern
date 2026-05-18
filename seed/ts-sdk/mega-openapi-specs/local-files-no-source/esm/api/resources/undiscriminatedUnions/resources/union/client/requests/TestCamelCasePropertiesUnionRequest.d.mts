import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         paymentMethod: {
 *             method: "card",
 *             cardNumber: "1234567890123456"
 *         }
 *     }
 */
export interface TestCamelCasePropertiesUnionRequest {
    paymentMethod: SeedApi.undiscriminatedUnions.PaymentMethodUnion;
}
