import { RawSchemas, visitRawAuthSchemeDeclaration } from "@fern-api/fern-definition-schema";
import {
    AuthScheme,
    FernIr,
    HttpMethod,
    IntermediateRepresentation,
    OAuthConfiguration,
    RequestPropertyValue
} from "@fern-api/ir-sdk";
import { getWireValue } from "@fern-api/ir-utils";

const HTTP_METHOD_MAP: Record<string, HttpMethod | undefined> = {
    GET: HttpMethod.Get,
    POST: HttpMethod.Post,
    PUT: HttpMethod.Put,
    PATCH: HttpMethod.Patch,
    DELETE: HttpMethod.Delete
};

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
    if (!authOverrides["auth-schemes"] || !ir.auth) {
        return ir;
    }

    const authSchemes = authOverrides["auth-schemes"];
    const updatedSchemes: AuthScheme[] = [];

    for (const scheme of ir.auth.schemes) {
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
            oauth: (oauthScheme) => resolveOAuthScheme({ ir, key: scheme.key, oauthScheme })
        });

        updatedSchemes.push(resolvedScheme ?? scheme);
    }

    return { ...ir, auth: { ...ir.auth, schemes: updatedSchemes } };
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
    const resolved = resolveEndpointFromReference({ ir, endpointRef: tokenEndpointConfig.endpoint });
    if (resolved == null) {
        return undefined;
    }

    const { endpoint, serviceId, subpackageId } = resolved;
    const reqProps = tokenEndpointConfig["request-properties"];
    const resProps = tokenEndpointConfig["response-properties"];

    const clientIdProp = findRequestBodyProperty({
        ir,
        endpoint,
        wireValue: extractWireName(reqProps?.["client-id"], "client_id")
    });
    const clientSecretProp = findRequestBodyProperty({
        ir,
        endpoint,
        wireValue: extractWireName(reqProps?.["client-secret"], "client_secret")
    });
    const accessTokenProp = findResponseProperty({
        ir,
        endpoint,
        wireValue: extractWireName(resProps?.["access-token"], "access_token")
    });

    if (clientIdProp == null || clientSecretProp == null || accessTokenProp == null) {
        return undefined;
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
                endpointReference: { endpointId: endpoint.id, serviceId, subpackageId },
                requestProperties: {
                    clientId: clientIdProp,
                    clientSecret: clientSecretProp,
                    scopes: undefined,
                    customProperties: findCustomRequestProperties({
                        ir,
                        endpoint,
                        excludeWireValues: [
                            extractWireName(reqProps?.["client-id"], "client_id"),
                            extractWireName(reqProps?.["client-secret"], "client_secret")
                        ]
                    })
                },
                responseProperties: {
                    accessToken: accessTokenProp,
                    expiresIn: findResponseProperty({
                        ir,
                        endpoint,
                        wireValue: extractWireName(resProps?.["expires-in"], "expires_in")
                    }),
                    refreshToken: findResponseProperty({
                        ir,
                        endpoint,
                        wireValue: extractWireName(resProps?.["refresh-token"], "refresh_token")
                    })
                }
            },
            refreshEndpoint:
                oauthScheme["refresh-token"] != null
                    ? resolveRefreshEndpoint({ ir, refreshTokenConfig: oauthScheme["refresh-token"] })
                    : undefined
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
    const resolved = resolveEndpointFromReference({ ir, endpointRef: refreshTokenConfig.endpoint });
    if (resolved == null) {
        return undefined;
    }

    const { endpoint, serviceId, subpackageId } = resolved;
    const reqProps = refreshTokenConfig["request-properties"];
    const resProps = refreshTokenConfig["response-properties"];

    const refreshTokenReqProp = findRequestBodyProperty({
        ir,
        endpoint,
        wireValue: extractWireName(reqProps?.["refresh-token"], "refresh_token")
    });
    const accessTokenProp = findResponseProperty({
        ir,
        endpoint,
        wireValue: extractWireName(resProps?.["access-token"], "access_token")
    });

    if (refreshTokenReqProp == null || accessTokenProp == null) {
        return undefined;
    }

    return {
        endpointReference: { endpointId: endpoint.id, serviceId, subpackageId },
        requestProperties: { refreshToken: refreshTokenReqProp },
        responseProperties: {
            accessToken: accessTokenProp,
            expiresIn: findResponseProperty({
                ir,
                endpoint,
                wireValue: extractWireName(resProps?.["expires-in"], "expires_in")
            }),
            refreshToken: findResponseProperty({
                ir,
                endpoint,
                wireValue: extractWireName(resProps?.["refresh-token"], "refresh_token")
            })
        }
    };
}

function resolveEndpointFromReference({
    ir,
    endpointRef
}: {
    ir: IntermediateRepresentation;
    endpointRef: string;
}): { endpoint: FernIr.HttpEndpoint; serviceId: string; subpackageId: string | undefined } | undefined {
    const parts = endpointRef.trim().split(/\s+/);
    if (parts.length !== 2) {
        return undefined;
    }
    const method = HTTP_METHOD_MAP[parts[0]?.toUpperCase() ?? ""];
    const targetPath = parts[1]?.replace(/\/+$/, "");
    if (method == null || targetPath == null) {
        return undefined;
    }

    for (const [serviceId, service] of Object.entries(ir.services)) {
        for (const endpoint of service.endpoints) {
            if (endpoint.method !== method) {
                continue;
            }
            const endpointPath = reconstructPath(endpoint.fullPath);
            if (endpointPath === targetPath) {
                const subpackageId = Object.entries(ir.subpackages).find(([, sp]) => sp.service === serviceId)?.[0];
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

/** Extracts the wire name from a `$request.propName` or `$response.propName` string, falling back to a default. */
function extractWireName(value: string | undefined, defaultName: string): string {
    if (value == null) {
        return defaultName;
    }
    const match = value.match(/^\$(?:request|response)\.(.+)$/);
    return match?.[1] ?? value;
}

/** Looks up an object property by wire value from a list of IR object properties. */
function findObjectPropertyByWireValue(
    properties: FernIr.ObjectProperty[],
    wireValue: string
): FernIr.ObjectProperty | undefined {
    return properties.find((prop) => getWireValue(prop.name) === wireValue);
}

/** Resolves object properties from a named type in the IR. */
function getObjectPropertiesForNamedType(
    ir: IntermediateRepresentation,
    typeId: string
): FernIr.ObjectProperty[] | undefined {
    const typeDecl = ir.types[typeId];
    if (typeDecl?.shape.type === "object") {
        return typeDecl.shape.properties;
    }
    return undefined;
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

    let properties: FernIr.ObjectProperty[] | undefined;
    if (endpoint.requestBody.type === "inlinedRequestBody") {
        properties = endpoint.requestBody.properties;
    } else if (endpoint.requestBody.type === "reference" && endpoint.requestBody.requestBodyType.type === "named") {
        properties = getObjectPropertiesForNamedType(ir, endpoint.requestBody.requestBodyType.typeId);
    }

    const prop = properties != null ? findObjectPropertyByWireValue(properties, wireValue) : undefined;
    if (prop == null) {
        return undefined;
    }
    return {
        propertyPath: undefined,
        property: RequestPropertyValue.body({ ...prop })
    };
}

function findCustomRequestProperties({
    ir,
    endpoint,
    excludeWireValues
}: {
    ir: IntermediateRepresentation;
    endpoint: FernIr.HttpEndpoint;
    excludeWireValues: string[];
}): FernIr.RequestProperty[] | undefined {
    if (endpoint.requestBody == null) {
        return undefined;
    }

    let properties: FernIr.ObjectProperty[] | undefined;
    if (endpoint.requestBody.type === "inlinedRequestBody") {
        properties = endpoint.requestBody.properties;
    } else if (endpoint.requestBody.type === "reference" && endpoint.requestBody.requestBodyType.type === "named") {
        properties = getObjectPropertiesForNamedType(ir, endpoint.requestBody.requestBodyType.typeId);
    }

    if (properties == null) {
        return undefined;
    }

    const excludeSet = new Set(excludeWireValues);
    const customProps = properties
        .filter((prop) => !excludeSet.has(getWireValue(prop.name)))
        .map((prop) => ({
            propertyPath: undefined,
            property: RequestPropertyValue.body({ ...prop })
        }));

    return customProps.length > 0 ? customProps : undefined;
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
    if (endpoint.response?.body?.type !== "json") {
        return undefined;
    }
    const responseBodyType = endpoint.response.body.value.responseBodyType;
    if (responseBodyType.type !== "named") {
        return undefined;
    }
    const properties = getObjectPropertiesForNamedType(ir, responseBodyType.typeId);
    const prop = properties != null ? findObjectPropertyByWireValue(properties, wireValue) : undefined;
    if (prop == null) {
        return undefined;
    }
    return { propertyPath: undefined, property: prop };
}
