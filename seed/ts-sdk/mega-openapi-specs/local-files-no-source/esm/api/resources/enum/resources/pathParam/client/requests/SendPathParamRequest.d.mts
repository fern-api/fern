import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         operand: ">",
 *         operandOrColor: "red"
 *     }
 */
export interface SendPathParamRequest {
    operand: SeedApi.enum_.Operand;
    operandOrColor: SeedApi.enum_.ColorOrOperand;
}
