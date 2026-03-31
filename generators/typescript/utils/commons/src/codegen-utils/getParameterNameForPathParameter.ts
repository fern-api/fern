import { CaseConverter } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { getSdkParameterPropertyName } from "./getSdkParameterPropertyName.js";

/**
 * Determines the casing of the path parameter when used as a positional function parameter
 */
export function getParameterNameForPositionalPathParameter({
    pathParameter,
    retainOriginalCasing,
    parameterNaming,
    caseConverter
}: {
    pathParameter: FernIr.PathParameter;
    retainOriginalCasing: boolean;
    parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
    caseConverter: CaseConverter;
}): string {
    return getParameterNameForPathParameterInternalName({
        pathParameterName: pathParameter.name,
        retainOriginalCasing,
        includeSerdeLayer: false,
        parameterNaming,
        caseConverter
    });
}

/**
 * Determines the casing of the root path parameter which is put into the client class options class
 */
export function getParameterNameForRootPathParameter({
    pathParameter,
    retainOriginalCasing,
    parameterNaming,
    caseConverter
}: {
    pathParameter: FernIr.PathParameter;
    retainOriginalCasing: boolean;
    parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
    caseConverter: CaseConverter;
}): string {
    if (pathParameter.location !== "ROOT") {
        throw new Error("pathParameter.location must be ROOT");
    }
    return getParameterNameForPathParameterInternalName({
        pathParameterName: pathParameter.name,
        retainOriginalCasing,
        includeSerdeLayer: false,
        parameterNaming,
        caseConverter
    });
}
/**
 * Determines the casing of the root path parameter which is put into the client class options class
 */
export function getParameterNameForRootExamplePathParameter({
    pathParameter,
    retainOriginalCasing,
    parameterNaming,
    caseConverter
}: {
    pathParameter: FernIr.ExamplePathParameter;
    retainOriginalCasing: boolean;
    parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
    caseConverter: CaseConverter;
}): string {
    return getParameterNameForPathParameterInternalName({
        pathParameterName: pathParameter.name,
        retainOriginalCasing,
        includeSerdeLayer: false,
        parameterNaming,
        caseConverter
    });
}

/**
 * Determines the casing of the path parameter when used as a parameter inside an object/interface
 */
export function getParameterNameForPropertyPathParameter({
    pathParameter,
    retainOriginalCasing,
    includeSerdeLayer,
    parameterNaming,
    caseConverter
}: {
    pathParameter: FernIr.PathParameter;
    retainOriginalCasing: boolean;
    includeSerdeLayer: boolean;
    parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
    caseConverter: CaseConverter;
}): string {
    return getParameterNameForPropertyPathParameterName({
        pathParameterName: pathParameter.name,
        retainOriginalCasing,
        includeSerdeLayer,
        parameterNaming,
        caseConverter
    });
}

/**
 * Determines the casing of the path parameter when used as a parameter inside an object/interface
 */
export function getParameterNameForPropertyPathParameterName({
    pathParameterName,
    retainOriginalCasing,
    includeSerdeLayer,
    parameterNaming,
    caseConverter
}: {
    pathParameterName: FernIr.NameOrString;
    retainOriginalCasing: boolean;
    includeSerdeLayer: boolean;
    parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
    caseConverter: CaseConverter;
}): string {
    return getParameterNameForPathParameterInternalName({
        pathParameterName,
        retainOriginalCasing,
        includeSerdeLayer,
        parameterNaming,
        caseConverter
    });
}

function getParameterNameForPathParameterInternalName({
    pathParameterName,
    retainOriginalCasing,
    includeSerdeLayer,
    parameterNaming,
    caseConverter
}: {
    pathParameterName: FernIr.NameOrString;
    retainOriginalCasing: boolean;
    includeSerdeLayer: boolean;
    parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
    caseConverter: CaseConverter;
}): string {
    return getSdkParameterPropertyName({
        name: pathParameterName,
        includeSerdeLayer,
        retainOriginalCasing,
        parameterNaming,
        caseConverter
    });
}
