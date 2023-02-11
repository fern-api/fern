import { OpenAPIV3 } from "openapi-types";
import { isReferenceObject } from "./utils";

const PARAMETER_REFERENCE_PREFIX = "#/components/parameters/";

export function resolveParameterReference({
    document,
    parameter,
}: {
    document: OpenAPIV3.Document;
    parameter: OpenAPIV3.ReferenceObject;
}): OpenAPIV3.ParameterObject | undefined {
    if (document.components == null || document.components.parameters == null) {
        return undefined;
    }
    if (!parameter.$ref.startsWith(PARAMETER_REFERENCE_PREFIX)) {
        return undefined;
    }
    const parameterKey = parameter.$ref.substring(PARAMETER_REFERENCE_PREFIX.length);
    const resolvedParameter = document.components.parameters[parameterKey];
    if (resolvedParameter == null) {
        return undefined;
    }
    if (isReferenceObject(resolvedParameter)) {
        return resolveParameterReference({
            document,
            parameter: resolvedParameter,
        });
    }
    return resolvedParameter;
}
