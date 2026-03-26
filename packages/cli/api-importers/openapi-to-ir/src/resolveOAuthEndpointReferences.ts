import { RawSchemas, visitRawAuthSchemeDeclaration } from "@fern-api/fern-definition-schema";
import {
    AuthScheme,
    FernIr,
    HttpMethod,
    IntermediateRepresentation,
    OAuthConfiguration,
    RequestPropertyValue
} from "@fern-api/ir-sdk";

export interface OAuthResolutionLogger {
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
}

/**
 * Resolves OAuth endpoint references in the IR auth schemes.
 *
 * This must run AFTER all specs have been merged into a single IR,
 * because the OAuth token endpoint may be defined in a different spec
 * than the one that defines the auth scheme.
 */
export function resolveOAuthEndpointReferences({
    ir,
    authOverrides,
    logger
}: {
    ir: IntermediateRepresentation;
    authOverrides: RawSchemas.WithAuthSchema;
    logger?: OAuthResolutionLogger;
}): IntermediateRepresentation {
    logger?.info("[resolveOAuth] Starting OAuth endpoint reference resolution");
    logger?.info(`[resolveOAuth] authOverrides keys: ${JSON.stringify(Object.keys(authOverrides))}`);
    logger?.info(`[resolveOAuth] auth-schemes present: ${authOverrides["auth-schemes"] != null}`);
    logger?.info(`[resolveOAuth] ir.auth present: ${ir.auth != null}`);
    logger?.info(`[resolveOAuth] ir.auth.schemes count: ${ir.auth?.schemes?.length ?? 0}`);
    logger?.info(`[resolveOAuth] ir.services count: ${Object.keys(ir.services).length}`);

    if (!authOverrides["auth-schemes"]) {
        logger?.warn("[resolveOAuth] No auth-schemes found in authOverrides, returning IR unchanged");
        return ir;
    }
    if (!ir.auth) {
        logger?.warn("[resolveOAuth] No ir.auth found, returning IR unchanged");
        return ir;
    }

    const authSchemes = authOverrides["auth-schemes"];
    logger?.info(`[resolveOAuth] auth-schemes keys: ${JSON.stringify(Object.keys(authSchemes))}`);
    const updatedSchemes: AuthScheme[] = [];

    for (const scheme of ir.auth.schemes) {
        logger?.info(`[resolveOAuth] Processing IR auth scheme: type=${scheme.type}, key=${scheme.key}`);

        // Only replace bearer schemes that were placeholders for OAuth
        if (scheme.type !== "bearer") {
            logger?.info(`[resolveOAuth] Scheme type is "${scheme.type}", not "bearer" - keeping as-is`);
            updatedSchemes.push(scheme);
            continue;
        }

        const rawDeclaration = authSchemes[scheme.key];
        if (rawDeclaration == null) {
            logger?.info(
                `[resolveOAuth] No raw declaration found for key "${scheme.key}" in auth-schemes - keeping bearer`
            );
            updatedSchemes.push(scheme);
            continue;
        }

        logger?.info(
            `[resolveOAuth] Found raw declaration for key "${scheme.key}": ${JSON.stringify(rawDeclaration).substring(0, 300)}`
        );

        const resolvedScheme = visitRawAuthSchemeDeclaration<AuthScheme | undefined>(rawDeclaration, {
            header: () => {
                logger?.info("[resolveOAuth] visitRawAuthSchemeDeclaration -> header (not OAuth)");
                return undefined;
            },
            basic: () => {
                logger?.info("[resolveOAuth] visitRawAuthSchemeDeclaration -> basic (not OAuth)");
                return undefined;
            },
            tokenBearer: () => {
                logger?.info("[resolveOAuth] visitRawAuthSchemeDeclaration -> tokenBearer (not OAuth)");
                return undefined;
            },
            inferredBearer: () => {
                logger?.info("[resolveOAuth] visitRawAuthSchemeDeclaration -> inferredBearer (not OAuth)");
                return undefined;
            },
            oauth: (oauthScheme) => {
                logger?.info(`[resolveOAuth] visitRawAuthSchemeDeclaration -> oauth branch! type=${oauthScheme.type}`);
                return resolveOAuthScheme({ ir, key: scheme.key, oauthScheme, logger });
            }
        });

        if (resolvedScheme != null) {
            logger?.info(
                `[resolveOAuth] Successfully resolved OAuth for key "${scheme.key}", type=${resolvedScheme.type}`
            );
        } else {
            logger?.warn(`[resolveOAuth] Failed to resolve OAuth for key "${scheme.key}" - keeping bearer placeholder`);
        }

        updatedSchemes.push(resolvedScheme ?? scheme);
    }

    logger?.info(`[resolveOAuth] Final auth schemes: ${updatedSchemes.map((s) => `${s.key}:${s.type}`).join(", ")}`);

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
    oauthScheme,
    logger
}: {
    ir: IntermediateRepresentation;
    key: string;
    oauthScheme: RawSchemas.OAuthSchemeSchema;
    logger?: OAuthResolutionLogger;
}): AuthScheme | undefined {
    if (oauthScheme.type !== "client-credentials") {
        logger?.warn(`[resolveOAuth] OAuth type "${oauthScheme.type}" is not "client-credentials" - unsupported`);
        return undefined;
    }

    const tokenEndpointConfig = oauthScheme["get-token"];
    logger?.info(`[resolveOAuth] Token endpoint config: ${JSON.stringify(tokenEndpointConfig).substring(0, 300)}`);

    const parsed = parseEndpointReference(tokenEndpointConfig.endpoint);
    if (parsed == null) {
        logger?.error(`[resolveOAuth] Failed to parse endpoint reference: "${tokenEndpointConfig.endpoint}"`);
        return undefined;
    }

    const { method, path } = parsed;
    logger?.info(`[resolveOAuth] Looking for endpoint: ${method} ${path}`);

    // Log all available endpoints for debugging
    for (const [svcId, service] of Object.entries(ir.services)) {
        for (const ep of service.endpoints) {
            const epPath = reconstructPath(ep.fullPath);
            logger?.info(`[resolveOAuth] Available endpoint: ${ep.method} ${epPath} (service=${svcId}, id=${ep.id})`);
        }
    }

    const resolved = findEndpointInIr({ ir, method, path });
    if (resolved == null) {
        logger?.error(`[resolveOAuth] Could not find endpoint ${method} ${path} in merged IR`);
        return undefined;
    }

    logger?.info(`[resolveOAuth] Found matching endpoint: id=${resolved.endpoint.id}, serviceId=${resolved.serviceId}`);

    const { endpoint, serviceId, subpackageId } = resolved;

    const requestProperties = tokenEndpointConfig["request-properties"];
    const responseProperties = tokenEndpointConfig["response-properties"];

    const clientIdWire = extractPropertyName(requestProperties?.["client-id"]) ?? "client_id";
    const clientSecretWire = extractPropertyName(requestProperties?.["client-secret"]) ?? "client_secret";
    const accessTokenWire = extractPropertyName(responseProperties?.["access-token"]) ?? "access_token";

    logger?.info(
        `[resolveOAuth] Looking for request props: clientId="${clientIdWire}", clientSecret="${clientSecretWire}"`
    );
    logger?.info(`[resolveOAuth] Looking for response prop: accessToken="${accessTokenWire}"`);
    logger?.info(`[resolveOAuth] Endpoint requestBody type: ${endpoint.requestBody?.type ?? "none"}`);
    if (endpoint.requestBody?.type === "inlinedRequestBody") {
        logger?.info(
            `[resolveOAuth] Request body properties: ${endpoint.requestBody.properties.map((p) => p.name.wireValue).join(", ")}`
        );
    }
    logger?.info(`[resolveOAuth] Endpoint response body type: ${endpoint.response?.body?.type ?? "none"}`);

    const clientIdProp = findRequestBodyProperty({ endpoint, wireValue: clientIdWire });
    const clientSecretProp = findRequestBodyProperty({ endpoint, wireValue: clientSecretWire });
    const accessTokenProp = findResponseProperty({ ir, endpoint, wireValue: accessTokenWire });

    logger?.info(`[resolveOAuth] clientIdProp found: ${clientIdProp != null}`);
    logger?.info(`[resolveOAuth] clientSecretProp found: ${clientSecretProp != null}`);
    logger?.info(`[resolveOAuth] accessTokenProp found: ${accessTokenProp != null}`);

    if (clientIdProp == null || clientSecretProp == null || accessTokenProp == null) {
        logger?.error(
            `[resolveOAuth] Missing required properties - clientId=${clientIdProp != null}, clientSecret=${clientSecretProp != null}, accessToken=${accessTokenProp != null}`
        );
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
        logger?.info("[resolveOAuth] Resolving refresh endpoint...");
        refreshEndpoint = resolveRefreshEndpoint({ ir, refreshTokenConfig, logger });
    }

    logger?.info(`[resolveOAuth] Successfully building OAuth AuthScheme for key="${key}"`);

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
    refreshTokenConfig,
    logger
}: {
    ir: IntermediateRepresentation;
    refreshTokenConfig: RawSchemas.OAuthRefreshTokenEndpointSchema;
    logger?: OAuthResolutionLogger;
}): FernIr.OAuthRefreshEndpoint | undefined {
    const parsed = parseEndpointReference(refreshTokenConfig.endpoint);
    if (parsed == null) {
        logger?.error(`[resolveOAuth] Failed to parse refresh endpoint: "${refreshTokenConfig.endpoint}"`);
        return undefined;
    }

    const resolved = findEndpointInIr({ ir, ...parsed });
    if (resolved == null) {
        logger?.error(`[resolveOAuth] Could not find refresh endpoint ${parsed.method} ${parsed.path}`);
        return undefined;
    }

    const { endpoint, serviceId, subpackageId } = resolved;
    const responseProperties = refreshTokenConfig["response-properties"];
    const requestProperties = refreshTokenConfig["request-properties"];

    const refreshTokenReqProp = findRequestBodyProperty({
        endpoint,
        wireValue: extractPropertyName(requestProperties?.["refresh-token"]) ?? "refresh_token"
    });
    const accessTokenProp = findResponseProperty({
        ir,
        endpoint,
        wireValue: extractPropertyName(responseProperties?.["access-token"]) ?? "access_token"
    });

    if (refreshTokenReqProp == null || accessTokenProp == null) {
        logger?.error("[resolveOAuth] Missing required refresh endpoint properties");
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
    endpoint,
    wireValue
}: {
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
