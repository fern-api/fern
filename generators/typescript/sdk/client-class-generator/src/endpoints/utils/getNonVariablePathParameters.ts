import { PathParameter } from "@fern-fern/ir-sdk/api"

export function getNonVariablePathParameters(pathParameters: PathParameter[]): PathParameter[] {
    return pathParameters.filter((pathParameter) => pathParameter.variable == null)
}
