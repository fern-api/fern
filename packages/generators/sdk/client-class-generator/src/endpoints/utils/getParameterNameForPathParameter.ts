import { PathParameter } from "@fern-fern/ir-model/http";

export function getParameterNameForPathParameter(pathParameter: PathParameter): string {
    return pathParameter.name.camelCase.unsafeName;
}
