import { FernIr } from "@fern-fern/ir-sdk";
export function getNonVariablePathParameters(pathParameters: FernIr.PathParameter[]): FernIr.PathParameter[] {
    return pathParameters.filter((pathParameter) => pathParameter.variable == null);
}
