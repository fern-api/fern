import { PathParameter } from "@fern-fern/ir-sdk/api";

export function getParameterNameForPathParameter(pathParameter: PathParameter): string {
    return pathParameter.name.camelCase.unsafeName;
}
