import { ExamplePathParameter, Name, PathParameter } from "@fern-fern/ir-sdk/api";

/**
 * Determines the casing of the path parameter when used as a positional function parameter
 */
export function getParameterNameForPositionalPathParameter({
    pathParameter,
    retainOriginalCasing
}: {
    pathParameter: PathParameter;
    retainOriginalCasing: boolean;
}): string {
    return getParameterNameForPathParameterInternalName({
        pathParameterName: pathParameter.name,
        retainOriginalCasing
    });
}

/**
 * Determines the casing of the root path parameter which is put into the client class options class
 */
export function getParameterNameForRootPathParameter({
    pathParameter,
    retainOriginalCasing
}: {
    pathParameter: PathParameter;
    retainOriginalCasing: boolean;
}): string {
    if (pathParameter.location !== "ROOT") {
        throw new Error("pathParameter.location must be ROOT");
    }
    return getParameterNameForPathParameterInternalName({
        pathParameterName: pathParameter.name,
        retainOriginalCasing
    });
}
/**
 * Determines the casing of the root path parameter which is put into the client class options class
 */
export function getParameterNameForRootExamplePathParameter({
    pathParameter,
    retainOriginalCasing
}: {
    pathParameter: ExamplePathParameter;
    retainOriginalCasing: boolean;
}): string {
    return getParameterNameForPathParameterInternalName({
        pathParameterName: pathParameter.name,
        retainOriginalCasing
    });
}

/**
 * Determines the casing of the path parameter when used as a parameter inside an object/interface
 */
export function getParameterNameForPropertyPathParameter({
    pathParameter,
    retainOriginalCasing,
    includeSerdeLayer
}: {
    pathParameter: PathParameter;
    retainOriginalCasing: boolean;
    includeSerdeLayer: boolean;
}): string {
    return getParameterNameForPropertyPathParameterName({
        pathParameterName: pathParameter.name,
        retainOriginalCasing,
        includeSerdeLayer
    });
}

/**
 * Determines the casing of the path parameter when used as a parameter inside an object/interface
 */
export function getParameterNameForPropertyPathParameterName({
    pathParameterName,
    retainOriginalCasing,
    includeSerdeLayer
}: {
    pathParameterName: Name;
    retainOriginalCasing: boolean;
    includeSerdeLayer: boolean;
}): string {
    if (retainOriginalCasing) {
        return pathParameterName.originalName;
    }
    return pathParameterName.camelCase.unsafeName;
}

function getParameterNameForPathParameterInternalName({
    pathParameterName,
    retainOriginalCasing
}: {
    pathParameterName: Name;
    retainOriginalCasing: boolean;
}): string {
    if (retainOriginalCasing) {
        return pathParameterName.originalName;
    }
    return pathParameterName.camelCase.safeName;
}
