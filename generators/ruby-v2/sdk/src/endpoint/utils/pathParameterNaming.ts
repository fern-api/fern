import { CaseConverter, getOriginalName, getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";

export interface InlinedPathParameterNames {
    /** Ruby attribute name used for the wrapper field and endpoint keyword argument. */
    attributeName: string;
    /** Key the field serializes to in the wrapper's hash representation. */
    wireName: string;
    /** Whether the path parameter was renamed to avoid a body property collision. */
    isRenamed: boolean;
}

/**
 * Path parameters are inlined into the request wrapper alongside inlined body properties,
 * so a path parameter can share its name with a body property (e.g. an `{idType}` path param
 * and an `idType` body field). Emitting both would produce duplicate wrapper fields whose
 * serialized keys overwrite each other, and the body-building `except` would strip the body
 * property from the request payload. Colliding path parameters are renamed with a
 * `_path_param` suffix so both values remain independently settable (the path parameter for
 * the URL, the body property for the request payload).
 */
export function getInlinedPathParameterNames({
    pathParameter,
    endpoint,
    caseConverter
}: {
    pathParameter: FernIr.PathParameter;
    endpoint: FernIr.HttpEndpoint;
    caseConverter: CaseConverter;
}): InlinedPathParameterNames {
    const attributeName = caseConverter.snakeSafe(pathParameter.name);
    const wireName = getOriginalName(pathParameter.name);
    const bodyPropertyNames = getInlinedBodyPropertyNames({ endpoint, caseConverter });
    if (!bodyPropertyNames.has(attributeName) && !bodyPropertyNames.has(wireName)) {
        return { attributeName, wireName, isRenamed: false };
    }
    const reservedNames = bodyPropertyNames;
    for (const otherPathParameter of endpoint.allPathParameters) {
        if (otherPathParameter !== pathParameter) {
            reservedNames.add(caseConverter.snakeSafe(otherPathParameter.name));
            reservedNames.add(getOriginalName(otherPathParameter.name));
        }
    }
    let renamed = `${attributeName}_path_param`;
    while (reservedNames.has(renamed)) {
        renamed = `${renamed}_`;
    }
    return { attributeName: renamed, wireName: renamed, isRenamed: true };
}

function getInlinedBodyPropertyNames({
    endpoint,
    caseConverter
}: {
    endpoint: FernIr.HttpEndpoint;
    caseConverter: CaseConverter;
}): Set<string> {
    const names = new Set<string>();
    if (endpoint.requestBody?.type !== "inlinedRequestBody") {
        return names;
    }
    for (const property of [...endpoint.requestBody.properties, ...(endpoint.requestBody.extendedProperties ?? [])]) {
        names.add(caseConverter.snakeSafe(property.name));
        names.add(getWireValue(property.name));
    }
    return names;
}
