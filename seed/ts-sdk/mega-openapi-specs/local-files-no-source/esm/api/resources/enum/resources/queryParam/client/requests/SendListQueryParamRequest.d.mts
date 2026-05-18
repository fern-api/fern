import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         operand: [">"],
 *         operandOrColor: ["red"]
 *     }
 */
export interface SendListQueryParamRequest {
    operand?: SeedApi.enum_.Operand | SeedApi.enum_.Operand[];
    maybeOperand?: (SeedApi.enum_.Operand | null) | (SeedApi.enum_.Operand | null)[];
    operandOrColor?: SeedApi.enum_.ColorOrOperand | SeedApi.enum_.ColorOrOperand[];
    maybeOperandOrColor?: (SeedApi.enum_.ColorOrOperand | null) | (SeedApi.enum_.ColorOrOperand | null)[];
}
