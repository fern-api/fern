import { FernIr } from "@fern-fern/ir-sdk";
import { getSdkParameterPropertyName } from "./getSdkParameterPropertyName.js";

/**
 * Determines the casing of the path parameter when used as a positional function parameter
 */
export function getParameterNameForPositionalPathParameter({
    pathParameter,
    retainOriginalCasing,
    parameterNaming
}: {
    pathParameter: FernIr.PathParameter;
    retainOriginalCasing: boolean;
    parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
}): string {
    return getParameterNameForPathParameterInternalName({
        pathParameterName: pathParameter.name,
        retainOriginalCasing,
        includeSerdeLayer: false,
        parameterNaming
    });
}

/**
 * Determines the casing of the root path parameter which is put into the client class options class
 */
export function getParameterNameForRootPathParameter({
    pathParameter,
    retainOriginalCasing,
    parameterNaming
}: {
    pathParameter: FernIr.PathParameter;
    retainOriginalCasing: boolean;
    parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
}): string {
    if (pathParameter.location !== "ROOT") {
        throw new Error("pathParameter.location must be ROOT");
    }
    return getParameterNameForPathParameterInternalName({
        pathParameterName: pathParameter.name,
        retainOriginalCasing,
        includeSerdeLayer: false,
        parameterNaming
    });
}
/**
 * Determines the casing of the root path parameter which is put into the client class options class
 */
export function getParameterNameForRootExamplePathParameter({
    pathParameter,
    retainOriginalCasing,
    parameterNaming
}: {
    pathParameter: FernIr.ExamplePathParameter;
    retainOriginalCasing: boolean;
    parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
}): string {
    return getParameterNameForPathParameterInternalName({
        pathParameterName: pathParameter.name,
        retainOriginalCasing,
        includeSerdeLayer: false,
        parameterNaming
    });
}

/**
 * Determines the casing of the path parameter when used as a parameter inside an object/interface
 */
export function getParameterNameForPropertyPathParameter({
    pathParameter,
    retainOriginalCasing,
    includeSerdeLayer,
    parameterNaming
}: {
    pathParameter: FernIr.PathParameter;
    retainOriginalCasing: boolean;
    includeSerdeLayer: boolean;
    parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
}): string {
    return getParameterNameForPropertyPathParameterName({
        pathParameterName: pathParameter.name,
        retainOriginalCasing,
        includeSerdeLayer,
        parameterNaming
    });
}

/**
 * Determines the casing of the path parameter when used as a parameter inside an object/interface
 */
export function getParameterNameForPropertyPathParameterName({
    pathParameterName,
    retainOriginalCasing,
    includeSerdeLayer,
    parameterNaming
}: {
    pathParameterName: FernIr.Name;
    retainOriginalCasing: boolean;
    includeSerdeLayer: boolean;
    parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
}): string {
    return getParameterNameForPathParameterInternalName({
        pathParameterName,
        retainOriginalCasing,
        includeSerdeLayer,
        parameterNaming
    });
}

function getParameterNameForPathParameterInternalName({
    pathParameterName,
    retainOriginalCasing,
    includeSerdeLayer,
    parameterNaming
}: {
    pathParameterName: FernIr.Name;
    retainOriginalCasing: boolean;
    includeSerdeLayer: boolean;
    parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
}): string {
    return getSdkParameterPropertyName({
        name: pathParameterName,
        includeSerdeLayer,
        retainOriginalCasing,
        parameterNaming
    });
}
