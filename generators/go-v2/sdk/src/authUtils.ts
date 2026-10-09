import { CaseConverter, getOriginalName, NameInput } from "@fern-api/base-generator";
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
/**
 * Whether the API applies auth per-endpoint (each endpoint declares its own
 * schemes) rather than flatly on every request. In this mode auth headers are
 * routed per-endpoint via RequestOptions.AuthHeadersForEndpoint.
 */
export function isEndpointSecurity(ir: FernIr.IntermediateRepresentation): boolean {
    return ir.auth != null && ir.auth.requirement === "ENDPOINT_SECURITY";
}

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

const GRANT_TYPE_WIRE_VALUE = "grant_type";

/**
 * The client-credentials grant type is synthesized in the token request
 * rather than surfaced as a client option.
 */
export function isGrantTypeRequestProperty(requestProperty: FernIr.RequestProperty): boolean {
    if (requestProperty.property.type === "body" || requestProperty.property.type === "query") {
        return getOriginalName(requestProperty.property.name) === GRANT_TYPE_WIRE_VALUE;
    }
    return false;
}

/**
 * Checks if a request property is generated as a pointer type.
 */
export function isRequestPropertyPointer(
    requestProperty: FernIr.RequestProperty,
    irTypes: Record<string, FernIr.TypeDeclaration>
): boolean {
    return isTypeReferencePointer(getRequestPropertyValueType(requestProperty), irTypes);
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
 * Returns true if the given type reference is a non-optional, non-nullable boolean primitive.
 */
export function isPlainBooleanType(typeRef: FernIr.TypeReference): boolean {
    if (typeRef.type === "primitive") {
        return typeRef.primitive.v1 === FernIr.PrimitiveTypeV1.Boolean;
    }
    return false;
}

export function isTypeReferencePointer(
    typeRef: FernIr.TypeReference | undefined,
    irTypes: Record<string, FernIr.TypeDeclaration>,
    seen: Set<string> = new Set()
): boolean {
    if (typeRef == null) {
        return false;
    }
    if (typeRef.type === "container") {
        return typeRef.container.type === "optional" || typeRef.container.type === "nullable";
    }
    if (typeRef.type === "named") {
        if (seen.has(typeRef.typeId)) {
            return false;
        }
        seen.add(typeRef.typeId);
        const declaration = irTypes[typeRef.typeId];
        return declaration?.shape.type === "alias" && isTypeReferencePointer(declaration.shape.aliasOf, irTypes, seen);
    }
    return false;
}

function isTypeReferenceOptional(
    typeRef: FernIr.TypeReference | undefined,
    irTypes: Record<string, FernIr.TypeDeclaration>,
    seen: Set<string> = new Set()
): boolean {
    if (typeRef == null) {
        return false;
    }
    if (typeRef.type === "container") {
        return typeRef.container.type === "optional";
    }
    if (typeRef.type === "named") {
        if (seen.has(typeRef.typeId)) {
            return false;
        }
        seen.add(typeRef.typeId);
        const declaration = irTypes[typeRef.typeId];
        return declaration?.shape.type === "alias" && isTypeReferenceOptional(declaration.shape.aliasOf, irTypes, seen);
    }
    return false;
}

export function isTypeReferenceLiteral(
    typeRef: FernIr.TypeReference,
    irTypes: Record<string, FernIr.TypeDeclaration>,
    seen: Set<string> = new Set()
): boolean {
    if (typeRef.type === "container") {
        return typeRef.container.type === "literal";
    }
    if (typeRef.type === "named") {
        if (seen.has(typeRef.typeId)) {
            return false;
        }
        seen.add(typeRef.typeId);
        const declaration = irTypes[typeRef.typeId];
        return declaration?.shape.type === "alias" && isTypeReferenceLiteral(declaration.shape.aliasOf, irTypes, seen);
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
): Array<{ fieldName: string; isPointer: boolean }> {
    const params: Array<{ fieldName: string; isPointer: boolean }> = [];

    // Add non-literal endpoint headers
    for (const header of tokenEndpoint.headers) {
        if (isTypeReferenceLiteral(header.valueType, irTypes)) {
            continue;
        }
        params.push({
            fieldName: context.getFieldName(header.name),
            isPointer: isTypeReferencePointer(header.valueType, irTypes)
        });
    }

    // Add non-literal, non-optional body properties.
    // Handles both inlined request bodies and referenced type declarations.
    const bodyProperties = resolveTokenEndpointBodyProperties(tokenEndpoint, irTypes);
    for (const prop of bodyProperties) {
        if (isTypeReferenceLiteral(prop.valueType, irTypes)) {
            continue;
        }
        if (isTypeReferenceOptional(prop.valueType, irTypes)) {
            continue;
        }
        params.push({
            fieldName: context.getFieldName(prop.name),
            isPointer: isTypeReferencePointer(prop.valueType, irTypes)
        });
    }

    return params;
}
