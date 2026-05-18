import type * as SeedApi from "../../../../../../index.js";
/**
 * @example
 *     {
 *         operand: ">",
 *         operandOrColor: "red"
 *     }
 */
export interface SendInlinedRequestRequest {
    operand: SeedApi.enum_.Operand;
    maybeOperand?: SeedApi.enum_.Operand | null;
    operandOrColor: SeedApi.enum_.ColorOrOperand;
    maybeOperandOrColor?: SeedApi.enum_.ColorOrOperand | null;
}
