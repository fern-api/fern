import { PathParameter } from "@fern-api/ir-sdk";

export function getNonVariablePathParameters(pathParameters: PathParameter[]): PathParameter[] {
    return pathParameters.filter((pathParameter) => pathParameter.variable == null);
}
