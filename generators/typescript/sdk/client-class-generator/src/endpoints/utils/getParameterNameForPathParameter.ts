import { PathParameter } from "@fern-fern/ir-sdk/api";

export function getParameterNameForPathParameter({
    pathParameter,
    retainOriginalCasing
}: {
    pathParameter: PathParameter;
    retainOriginalCasing: boolean;
}): string {
    if (retainOriginalCasing) {
        return pathParameter.name.originalName;
    }
    return pathParameter.name.camelCase.unsafeName;
}
