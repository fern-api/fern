import { RawSchemas, visitRawAuthSchemeDeclaration } from "@fern-api/fern-definition-schema";
import {
    AuthScheme,
    FernIr,
    HttpMethod,
    IntermediateRepresentation,
    OAuthConfiguration,
    RequestPropertyValue
} from "@fern-api/ir-sdk";

/**
 * Resolves OAuth endpoint references in the IR auth schemes.
 *
 * This must run AFTER all specs have been merged into a single IR,
 * because the OAuth token endpoint may be defined in a different spec
 * than the one that defines the auth scheme.
 */
export function resolveOAuthEndpointReferences({
    ir,
    authOverrides
}: {
    ir: IntermediateRepresentation;
    authOverrides: RawSchemas.WithAuthSchema;
}): IntermediateRepresentation {
    if (!authOverrides["auth-schemes"]) {
        return ir;
    }
    if (!ir.auth) {
        return ir;
    }

    const authSchemes = authOverrides["auth-schemes"];
    const updatedSchemes: AuthScheme[] = [];

    for (const scheme of ir.auth.schemes) {
        // Only replace bearer schemes that were placeholders for OAuth
        if (scheme.type !== "bearer") {
            updatedSchemes.push(scheme);
            continue;
        }

        const rawDeclaration = authSchemes[scheme.key];
        if (rawDeclaration == null) {
            updatedSchemes.push(scheme);
            continue;
        }

        const resolvedScheme = visitRawAuthSchemeDeclaration<AuthScheme | undefined>(rawDeclaration, {
            header: () => undefined,
            basic: () => undefined,
            tokenBearer: () => undefined,
            inferredBearer: () => undefined,
            oauth: (oauthScheme) => {
                return resolveOAuthScheme({ ir, key: scheme.key, oauthScheme });
            }
        });

        updatedSchemes.push(resolvedScheme ?? scheme);
    }

    return {
        ...ir,
        auth: {
            ...ir.auth,
            schemes: updatedSchemes
        }
    };
}

function resolveOAuthScheme({
    ir,
    key,
    oauthScheme
}: {
    ir: IntermediateRepresentation;
    key: string;
    oauthScheme: RawSchemas.OAuthSchemeSchema;
}): AuthScheme | undefined {
    if (oauthScheme.type !== "client-credentials") {
        return undefined;
    }

    const tokenEndpointConfig = oauthScheme["get-token"];

    const parsed = parseEndpointReference(tokenEndpointConfig.endpoint);
    if (parsed == null) {
        return undefined;
    }

    const { method, path } = parsed;

    const resolved = findEndpointInIr({ ir, method, path });
    if (resolved == null) {
        return undefined;
    }

    const { endpoint, serviceId, subpackageId } = resolved;

    const requestProperties = tokenEndpointConfig["request-properties"];
    const responseProperties = tokenEndpointConfig["response-properties"];

    const clientIdWire = extractPropertyName(requestProperties?.["client-id"]) ?? "client_id";
    const clientSecretWire = extractPropertyName(requestProperties?.["client-secret"]) ?? "client_secret";
    const accessTokenWire = extractPropertyName(responseProperties?.["access-token"]) ?? "access_token";

    const clientIdProp = findRequestBodyProperty({ ir, endpoint, wireValue: clientIdWire });
    const clientSecretProp = findRequestBodyProperty({ ir, endpoint, wireValue: clientSecretWire });
    const accessTokenProp = findResponseProperty({ ir, endpoint, wireValue: accessTokenWire });

    if (clientIdProp == null || clientSecretProp == null || accessTokenProp == null) {
        return undefined;
    }

    const expiresInProp = findResponseProperty({
        ir,
        endpoint,
        wireValue: extractPropertyName(responseProperties?.["expires-in"]) ?? "expires_in"
    });
    const refreshTokenProp = findResponseProperty({
        ir,
        endpoint,
        wireValue: extractPropertyName(responseProperties?.["refresh-token"]) ?? "refresh_token"
    });

    let refreshEndpoint: FernIr.OAuthRefreshEndpoint | undefined;
    const refreshTokenConfig = oauthScheme["refresh-token"];
    if (refreshTokenConfig != null) {
        refreshEndpoint = resolveRefreshEndpoint({ ir, refreshTokenConfig });
    }

    return AuthScheme.oauth({
        key,
        docs: oauthScheme.docs,
        configuration: OAuthConfiguration.clientCredentials({
            clientIdEnvVar: oauthScheme["client-id-env"],
            clientSecretEnvVar: oauthScheme["client-secret-env"],
            tokenPrefix: oauthScheme["token-prefix"],
            tokenHeader: oauthScheme["token-header"],
            scopes: oauthScheme.scopes,
            tokenEndpoint: {
                endpointReference: {
                    endpointId: endpoint.id,
                    serviceId,
                    subpackageId
                },
                requestProperties: {
                    clientId: clientIdProp,
                    clientSecret: clientSecretProp,
                    scopes: undefined,
                    customProperties: undefined
                },
                responseProperties: {
                    accessToken: accessTokenProp,
                    expiresIn: expiresInProp,
                    refreshToken: refreshTokenProp
                }
            },
            refreshEndpoint
        })
    });
}

function resolveRefreshEndpoint({
    ir,
    refreshTokenConfig
}: {
    ir: IntermediateRepresentation;
    refreshTokenConfig: RawSchemas.OAuthRefreshTokenEndpointSchema;
}): FernIr.OAuthRefreshEndpoint | undefined {
    const parsed = parseEndpointReference(refreshTokenConfig.endpoint);
    if (parsed == null) {
        return undefined;
    }

    const resolved = findEndpointInIr({ ir, ...parsed });
    if (resolved == null) {
        return undefined;
    }

    const { endpoint, serviceId, subpackageId } = resolved;
    const responseProperties = refreshTokenConfig["response-properties"];
    const requestProperties = refreshTokenConfig["request-properties"];

    const refreshTokenReqProp = findRequestBodyProperty({
        ir,
        endpoint,
        wireValue: extractPropertyName(requestProperties?.["refresh-token"]) ?? "refresh_token"
    });
    const accessTokenProp = findResponseProperty({
        ir,
        endpoint,
        wireValue: extractPropertyName(responseProperties?.["access-token"]) ?? "access_token"
    });

    if (refreshTokenReqProp == null || accessTokenProp == null) {
        return undefined;
    }

    const expiresInProp = findResponseProperty({
        ir,
        endpoint,
        wireValue: extractPropertyName(responseProperties?.["expires-in"]) ?? "expires_in"
    });
    const refreshTokenRespProp = findResponseProperty({
        ir,
        endpoint,
        wireValue: extractPropertyName(responseProperties?.["refresh-token"]) ?? "refresh_token"
    });

    return {
        endpointReference: {
            endpointId: endpoint.id,
            serviceId,
            subpackageId
        },
        requestProperties: {
            refreshToken: refreshTokenReqProp
        },
        responseProperties: {
            accessToken: accessTokenProp,
            expiresIn: expiresInProp,
            refreshToken: refreshTokenRespProp
        }
    };
}

function parseEndpointReference(endpointRef: string): { method: HttpMethod; path: string } | undefined {
    const parts = endpointRef.trim().split(/\s+/);
    if (parts.length !== 2) {
        return undefined;
    }
    const [methodStr, path] = parts;
    const method = parseHttpMethod(methodStr ?? "");
    if (method == null || path == null) {
        return undefined;
    }
    return { method, path };
}

function parseHttpMethod(method: string): HttpMethod | undefined {
    switch (method.toUpperCase()) {
        case "GET":
            return HttpMethod.Get;
        case "POST":
            return HttpMethod.Post;
        case "PUT":
            return HttpMethod.Put;
        case "PATCH":
            return HttpMethod.Patch;
        case "DELETE":
            return HttpMethod.Delete;
        default:
            return undefined;
    }
}

function findEndpointInIr({ ir, method, path }: { ir: IntermediateRepresentation; method: HttpMethod; path: string }):
    | {
          endpoint: FernIr.HttpEndpoint;
          serviceId: string;
          subpackageId: string | undefined;
      }
    | undefined {
    const normalizedPath = path.replace(/\/+$/, "");

    for (const [serviceId, service] of Object.entries(ir.services)) {
        for (const endpoint of service.endpoints) {
            if (endpoint.method !== method) {
                continue;
            }

            const endpointPath = reconstructPath(endpoint.fullPath);
            if (endpointPath === normalizedPath) {
                const subpackageId = findSubpackageForService(ir, serviceId);
                return { endpoint, serviceId, subpackageId };
            }
        }
    }
    return undefined;
}

function reconstructPath(httpPath: FernIr.HttpPath): string {
    let result = httpPath.head;
    for (const part of httpPath.parts) {
        result += `{${part.pathParameter}}${part.tail}`;
    }
    return result.replace(/\/+$/, "");
}

function findSubpackageForService(ir: IntermediateRepresentation, serviceId: string): string | undefined {
    for (const [subpackageId, subpackage] of Object.entries(ir.subpackages)) {
        if (subpackage.service === serviceId) {
            return subpackageId;
        }
    }
    return undefined;
}

function extractPropertyName(value: string | undefined): string | undefined {
    if (value == null) {
        return undefined;
    }
    // Handle $request.propertyName or $response.propertyName format
    const match = value.match(/^\$(?:request|response)\.(.+)$/);
    return match?.[1] ?? value;
}

function findRequestBodyProperty({
    ir,
    endpoint,
    wireValue
}: {
    ir: IntermediateRepresentation;
    endpoint: FernIr.HttpEndpoint;
    wireValue: string;
}): FernIr.RequestProperty | undefined {
    if (endpoint.requestBody == null) {
        return undefined;
    }

    if (endpoint.requestBody.type === "inlinedRequestBody") {
        for (const prop of endpoint.requestBody.properties) {
            if (prop.name.wireValue === wireValue) {
                return {
                    propertyPath: undefined,
                    property: RequestPropertyValue.body({
                        name: prop.name,
                        valueType: prop.valueType,
                        availability: prop.availability,
                        docs: prop.docs,
                        propertyAccess: prop.propertyAccess,
                        v2Examples: prop.v2Examples
                    })
                };
            }
        }
    }

    // Handle reference-type request bodies by resolving the referenced type
    if (endpoint.requestBody.type === "reference") {
        const bodyType = endpoint.requestBody.requestBodyType;
        if (bodyType.type === "named") {
            const typeDecl = ir.types[bodyType.typeId];
            if (typeDecl?.shape.type === "object") {
                for (const prop of typeDecl.shape.properties) {
                    if (prop.name.wireValue === wireValue) {
                        return {
                            propertyPath: undefined,
                            property: RequestPropertyValue.body({
                                name: prop.name,
                                valueType: prop.valueType,
                                availability: prop.availability,
                                docs: prop.docs,
                                propertyAccess: prop.propertyAccess,
                                v2Examples: prop.v2Examples
                            })
                        };
                    }
                }
            }
        }
    }

    return undefined;
}

function findResponseProperty({
    ir,
    endpoint,
    wireValue
}: {
    ir: IntermediateRepresentation;
    endpoint: FernIr.HttpEndpoint;
    wireValue: string;
}): FernIr.ResponseProperty | undefined {
    if (endpoint.response?.body == null) {
        return undefined;
    }

    if (endpoint.response.body.type === "json") {
        const jsonResponse = endpoint.response.body;
        if (jsonResponse.value.responseBodyType.type === "named") {
            const typeId = jsonResponse.value.responseBodyType.typeId;
            if (typeId != null) {
                const typeDecl = ir.types[typeId];
                if (typeDecl?.shape.type === "object") {
                    for (const prop of typeDecl.shape.properties) {
                        if (prop.name.wireValue === wireValue) {
                            return {
                                propertyPath: undefined,
                                property: prop
                            };
                        }
                    }
                }
            }
        }
    }

    return undefined;
}
