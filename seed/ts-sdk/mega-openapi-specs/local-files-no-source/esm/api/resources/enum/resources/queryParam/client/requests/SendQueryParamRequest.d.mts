import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         operand: ">",
 *         operandOrColor: "red"
 *     }
 */
export interface SendQueryParamRequest {
    operand: SeedApi.enum_.Operand;
    maybeOperand?: SeedApi.enum_.Operand | null;
    operandOrColor: SeedApi.enum_.Color;
    maybeOperandOrColor?: SeedApi.enum_.ColorOrOperand | null;
}
