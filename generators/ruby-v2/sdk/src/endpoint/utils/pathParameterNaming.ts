import { CaseConverter, getOriginalName, getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";

export interface InlinedBodyPropertyName {
    /** Ruby attribute name used for the wrapper field and endpoint keyword argument. */
    attributeName: string;
    /** Whether the property name was restored to its wire-derived name. */
    isRenamed: boolean;
}

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
        names.add(caseConverter.snakeSafe(getWireValue(property.name)));
    }
    return names;
}

/**
 * The OpenAPI importer de-conflicts an inlined body property whose name collides with a
 * path parameter by prefixing it with the request name (e.g. an `idType` body field becomes
 * `identifierUpdateIdType` when there is an `{idType}` path parameter). Since colliding path
 * parameters are renamed with a `_path_param` suffix, the wire-derived name is free again,
 * so the body property is restored to it (e.g. `id_type`).
 */
export function getInlinedBodyPropertyName({
    property,
    endpoint,
    caseConverter
}: {
    property: FernIr.ObjectProperty;
    endpoint: FernIr.HttpEndpoint;
    caseConverter: CaseConverter;
}): InlinedBodyPropertyName {
    const attributeName = caseConverter.snakeSafe(property.name);
    const propertyWireValue = getWireValue(property.name);
    const wireAttributeName = caseConverter.snakeSafe(propertyWireValue);
    if (attributeName === wireAttributeName) {
        return { attributeName, isRenamed: false };
    }
    const collidesWithRenamedPathParameter = endpoint.allPathParameters.some((pathParameter) => {
        const pathParameterNames = getInlinedPathParameterNames({ pathParameter, endpoint, caseConverter });
        return (
            pathParameterNames.isRenamed &&
            (getOriginalName(pathParameter.name) === propertyWireValue ||
                caseConverter.snakeSafe(pathParameter.name) === wireAttributeName)
        );
    });
    if (!collidesWithRenamedPathParameter) {
        return { attributeName, isRenamed: false };
    }
    const reservedNames = new Set<string>();
    for (const pathParameter of endpoint.allPathParameters) {
        reservedNames.add(getInlinedPathParameterNames({ pathParameter, endpoint, caseConverter }).attributeName);
    }
    for (const queryParameter of endpoint.queryParameters) {
        reservedNames.add(caseConverter.snakeSafe(queryParameter.name));
    }
    for (const header of endpoint.headers) {
        reservedNames.add(caseConverter.snakeSafe(header.name));
    }
    if (endpoint.requestBody?.type === "inlinedRequestBody") {
        for (const otherProperty of [
            ...endpoint.requestBody.properties,
            ...(endpoint.requestBody.extendedProperties ?? [])
        ]) {
            if (otherProperty !== property) {
                reservedNames.add(caseConverter.snakeSafe(otherProperty.name));
            }
        }
    }
    if (reservedNames.has(wireAttributeName)) {
        return { attributeName, isRenamed: false };
    }
    return { attributeName: wireAttributeName, isRenamed: true };
}
