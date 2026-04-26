import { CaseConverter, NameInput } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "./SdkGeneratorContext.js";

/**
 * Gets the client accessor path for a service (e.g., "Auth" or "Nested.Api").
 * Builds the dot-separated path from the service's fernFilepath parts using PascalCase.
 */
export function getClientAccessPath(service: FernIr.HttpService, caseConverter: CaseConverter): string {
    const parts = service.name.fernFilepath.allParts.map((part) => caseConverter.pascalUnsafe(part));
    return parts.join(".");
}

/**
 * Gets the OAuth client credentials scheme from the IR auth configuration.
 */
export function getOAuthClientCredentialsScheme(ir: FernIr.IntermediateRepresentation): FernIr.OAuthScheme | undefined {
    if (ir.auth == null) {
        return undefined;
    }
    for (const scheme of ir.auth.schemes) {
        if (scheme.type === "oauth" && scheme.configuration?.type === "clientCredentials") {
            return scheme;
        }
    }
    return undefined;
}

/**
 * Gets the inferred auth scheme from the IR auth configuration.
 */
export function getInferredAuthScheme(ir: FernIr.IntermediateRepresentation): FernIr.InferredAuthScheme | undefined {
    if (ir.auth == null) {
        return undefined;
    }
    for (const scheme of ir.auth.schemes) {
        if (scheme.type === "inferred") {
            return scheme;
        }
    }
    return undefined;
}

/**
 * Gets the field name for a request property using the context helper.
 */
export function getRequestPropertyFieldName(
    context: SdkGeneratorContext,
    requestProperty: FernIr.RequestProperty
): string {
    if (requestProperty.property.type === "body" && requestProperty.property.name != null) {
        return context.getFieldName(requestProperty.property.name);
    }
    if (requestProperty.property.type === "query" && requestProperty.property.name != null) {
        return context.getFieldName(requestProperty.property.name);
    }
    // Fallback to default names if we can't extract from IR
    return "ClientId";
}

/**
 * Checks if a request property is optional (pointer type).
 */
export function isRequestPropertyOptional(requestProperty: FernIr.RequestProperty): boolean {
    return isTypeReferenceOptional(getRequestPropertyValueType(requestProperty));
}

/**
 * Gets the value type from a request property.
 */
export function getRequestPropertyValueType(requestProperty: FernIr.RequestProperty): FernIr.TypeReference | undefined {
    if (requestProperty.property.type === "body") {
        return requestProperty.property.valueType;
    }
    if (requestProperty.property.type === "query") {
        return requestProperty.property.valueType;
    }
    return undefined;
}

/**
 * Returns true if the given type reference is a non-optional, non-nullable string primitive.
 * Used to guard clientDefault generation, since the `== ""` zero-value check
 * and string assignment only compile for Go `string` types (not `*string`).
 */
export function isPlainStringType(typeRef: FernIr.TypeReference): boolean {
    if (typeRef.type === "container") {
        return false;
    }
    if (typeRef.type === "primitive") {
        return typeRef.primitive.v1 === FernIr.PrimitiveTypeV1.String;
    }
    return false;
}

/**
 * Checks if a type reference is optional.
 */
export function isTypeReferenceOptional(typeRef: FernIr.TypeReference | undefined): boolean {
    if (typeRef == null) {
        return false;
    }
    if (typeRef.type === "container") {
        return typeRef.container.type === "optional";
    }
    return false;
}

/**
 * Builds the URL path for an endpoint from its fullPath definition.
 */
export function getEndpointPath(endpoint: FernIr.HttpEndpoint): string {
    let path = endpoint.fullPath.head;
    for (const part of endpoint.fullPath.parts) {
        path += `{${part.pathParameter}}${part.tail}`;
    }
    if (!path.startsWith("/")) {
        path = "/" + path;
    }
    return path;
}

/**
 * Resolves body properties for a token endpoint, handling both inlined
 * request bodies and referenced type declarations.
 */
export function resolveTokenEndpointBodyProperties(
    tokenEndpoint: FernIr.HttpEndpoint,
    irTypes: Record<string, FernIr.TypeDeclaration>
): Array<{ name: FernIr.NameAndWireValueOrString; valueType: FernIr.TypeReference }> {
    if (tokenEndpoint.requestBody == null) {
        return [];
    }
    if (tokenEndpoint.requestBody.type === "inlinedRequestBody") {
        return tokenEndpoint.requestBody.properties;
    }
    if (tokenEndpoint.requestBody.type === "reference") {
        const typeRef = tokenEndpoint.requestBody.requestBodyType;
        if (typeRef.type === "named") {
            const typeDecl = irTypes[typeRef.typeId];
            if (typeDecl?.shape.type === "object") {
                return typeDecl.shape.properties;
            }
        }
    }
    return [];
}

/**
 * Gets credential parameters from a token endpoint (non-literal body/header params).
 * Used by both ClientGenerator and InferredAuthWireTestGenerator.
 */
export function getInferredAuthCredentialParams(
    tokenEndpoint: FernIr.HttpEndpoint,
    irTypes: Record<string, FernIr.TypeDeclaration>,
    context: { getFieldName(name: NameInput): string }
): Array<{ fieldName: string; isOptional: boolean }> {
    const params: Array<{ fieldName: string; isOptional: boolean }> = [];

    // Add non-literal endpoint headers
    for (const header of tokenEndpoint.headers) {
        if (header.valueType.type === "container" && header.valueType.container.type === "literal") {
            continue;
        }
        params.push({
            fieldName: context.getFieldName(header.name),
            isOptional: header.valueType.type === "container" && header.valueType.container.type === "optional"
        });
    }

    // Add non-literal, non-optional body properties.
    // Handles both inlined request bodies and referenced type declarations.
    const bodyProperties = resolveTokenEndpointBodyProperties(tokenEndpoint, irTypes);
    for (const prop of bodyProperties) {
        if (prop.valueType.type === "container" && prop.valueType.container.type === "literal") {
            continue;
        }
        const isOptional = prop.valueType.type === "container" && prop.valueType.container.type === "optional";
        if (isOptional) {
            continue;
        }
        params.push({
            fieldName: context.getFieldName(prop.name),
            isOptional: false
        });
    }

    return params;
}
