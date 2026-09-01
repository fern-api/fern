import { FernIr, type IntermediateRepresentation } from "@fern-api/ir-sdk";
import { getOriginalName, getWireValue } from "@fern-api/ir-utils";
import type { ApiConfigInput, AuthScheme } from "@postman/sdk-config";

/**
 * Adapts Fern IR API metadata into SDK Config v1 for post-cutover targets routed through sdk-gen-api.
 * Pre-cutover targets use Fern runtime bundles and do not invoke this mapper.
 */
export function mapFernIrToSdkConfigApi(ir: IntermediateRepresentation): ApiConfigInput {
    const environments = mapEnvironments(ir);
    const auth = mapAuth(ir);
    const headers = ir.headers.map((header) => ({
        name: getWireValue(header.name),
        ...(header.clientDefault != null ? { value: literalToString(header.clientDefault) } : {}),
        ...(header.docs != null ? { description: header.docs } : {}),
        ...(header.env != null ? { environmentVariable: header.env } : {})
    }));
    const environmentVariables = new Set<string>();
    for (const header of headers) {
        if (header.environmentVariable != null) {
            environmentVariables.add(header.environmentVariable);
        }
    }
    for (const scheme of auth?.schemes ?? []) {
        collectAuthEnvironmentVariables(scheme, environmentVariables);
    }

    return {
        baseUrl: environments.baseUrl,
        environments: environments.environments,
        environmentVariables: [...environmentVariables].sort().map((name) => ({ name })),
        ...(environments.defaultEnvironment != null ? { defaultEnvironment: environments.defaultEnvironment } : {}),
        ...(auth != null ? { auth } : {}),
        ...(headers.length > 0 ? { headers } : {})
    };
}

function mapEnvironments(ir: IntermediateRepresentation): {
    baseUrl: string;
    environments: ApiConfigInput["environments"];
    defaultEnvironment?: string;
} {
    const config = ir.environments;
    if (config == null) {
        return { baseUrl: "", environments: [] };
    }
    const defaultEnvironmentId = config.defaultEnvironment;
    switch (config.environments.type) {
        case "singleBaseUrl": {
            const environments = config.environments.environments.map((environment) => ({
                name: getOriginalName(environment.name),
                urls: [{ name: "default", url: environment.url }],
                ...(environment.docs != null ? { description: environment.docs } : {})
            }));
            const defaultIndex = config.environments.environments.findIndex(
                (environment) => environment.id === defaultEnvironmentId
            );
            return {
                baseUrl: defaultIndex >= 0 ? (environments[defaultIndex]?.urls[0]?.url ?? "") : "",
                environments,
                ...(defaultIndex >= 0 ? { defaultEnvironment: environments[defaultIndex]?.name } : {})
            };
        }
        case "multipleBaseUrls": {
            const namesByBaseUrlId = new Map(
                config.environments.baseUrls.map((baseUrl) => [baseUrl.id, getOriginalName(baseUrl.name)])
            );
            const environments = config.environments.environments.map((environment) => ({
                name: getOriginalName(environment.name),
                urls: Object.entries(environment.urls).map(([baseUrlId, url]) => ({
                    name: namesByBaseUrlId.get(baseUrlId) ?? baseUrlId,
                    url
                })),
                ...(environment.docs != null ? { description: environment.docs } : {})
            }));
            const defaultIndex = config.environments.environments.findIndex(
                (environment) => environment.id === defaultEnvironmentId
            );
            return {
                baseUrl: defaultIndex >= 0 ? (environments[defaultIndex]?.urls[0]?.url ?? "") : "",
                environments,
                ...(defaultIndex >= 0 ? { defaultEnvironment: environments[defaultIndex]?.name } : {})
            };
        }
    }
}

function mapAuth(ir: IntermediateRepresentation): ApiConfigInput["auth"] | undefined {
    if (ir.auth.schemes.length === 0) {
        return undefined;
    }
    const schemes = ir.auth.schemes.map((scheme) => mapAuthScheme(ir, scheme));
    const schemeIds = schemes.map((scheme) => scheme.id);
    const requirement = ir.auth.requirement;
    return {
        schemes,
        ...(requirement === "ALL"
            ? { requirements: [{ schemes: schemeIds }] }
            : requirement === "ANY"
              ? { requirements: schemeIds.map((id) => ({ schemes: [id] })) }
              : { endpointSecurity: true })
    };
}

function mapAuthScheme(ir: IntermediateRepresentation, scheme: FernIr.AuthScheme): AuthScheme {
    const id = scheme.key;
    switch (scheme.type) {
        case "bearer":
            return {
                id,
                type: "bearer",
                ...(scheme.tokenEnvVar != null ? { environmentVariable: scheme.tokenEnvVar } : {}),
                ...(scheme.docs != null ? { description: scheme.docs } : {})
            };
        case "basic":
            return {
                id,
                type: "basic",
                username: {
                    name: getOriginalName(scheme.username),
                    ...(scheme.usernameEnvVar != null ? { environmentVariable: scheme.usernameEnvVar } : {}),
                    ...(scheme.usernameOmit != null ? { omit: scheme.usernameOmit } : {})
                },
                password: {
                    name: getOriginalName(scheme.password),
                    ...(scheme.passwordEnvVar != null ? { environmentVariable: scheme.passwordEnvVar } : {}),
                    ...(scheme.passwordOmit != null ? { omit: scheme.passwordOmit } : {})
                },
                ...(scheme.docs != null ? { description: scheme.docs } : {})
            };
        case "header":
            return {
                id,
                type: "api-key",
                location: "header",
                name: getWireValue(scheme.name),
                ...(scheme.prefix != null ? { prefix: scheme.prefix } : {}),
                ...(scheme.headerEnvVar != null ? { environmentVariable: scheme.headerEnvVar } : {}),
                ...(scheme.docs != null ? { description: scheme.docs } : {})
            };
        case "oauth":
            return mapOauthScheme(ir, scheme);
        case "inferred":
            throw new Error(`SDK Config v1 cannot represent inferred Fern auth scheme ${id}`);
    }
}

function mapOauthScheme(ir: IntermediateRepresentation, scheme: FernIr.AuthScheme.Oauth): AuthScheme {
    const configuration = scheme.configuration;
    switch (configuration.type) {
        case "clientCredentials":
            return {
                id: scheme.key,
                type: "oauth2",
                flows: [
                    {
                        type: "client-credentials",
                        tokenUrl: resolveEndpointUrl(ir, configuration.tokenEndpoint.endpointReference),
                        ...(configuration.refreshEndpoint != null
                            ? {
                                  refreshUrl: resolveEndpointUrl(ir, configuration.refreshEndpoint.endpointReference)
                              }
                            : {}),
                        ...(configuration.scopes != null
                            ? { scopes: configuration.scopes.map((name) => ({ name })) }
                            : {})
                    }
                ],
                ...(configuration.clientIdEnvVar != null
                    ? { clientId: { environmentVariable: configuration.clientIdEnvVar } }
                    : {}),
                ...(configuration.clientSecretEnvVar != null
                    ? { clientSecret: { environmentVariable: configuration.clientSecretEnvVar } }
                    : {}),
                ...(configuration.tokenHeader != null ? { tokenHeader: configuration.tokenHeader } : {}),
                ...(configuration.tokenPrefix != null ? { tokenPrefix: configuration.tokenPrefix } : {}),
                ...(scheme.docs != null ? { description: scheme.docs } : {})
            };
        case "authorizationCode": {
            if (configuration.clientId.type === "literal") {
                throw new Error(
                    `SDK Config v1 cannot represent literal OAuth client ID for Fern auth scheme ${scheme.key}`
                );
            }
            return {
                id: scheme.key,
                type: "oauth2",
                flows: [
                    {
                        type: "authorization-code",
                        authorizationUrl: configuration.authorizationUrl,
                        tokenUrl: configuration.tokenUrl,
                        ...(configuration.refreshUrl != null ? { refreshUrl: configuration.refreshUrl } : {}),
                        ...(configuration.scopes != null
                            ? { scopes: configuration.scopes.map((name) => ({ name })) }
                            : {})
                    }
                ],
                clientId: { environmentVariable: configuration.clientId.value },
                ...(configuration.tokenHeader != null ? { tokenHeader: configuration.tokenHeader } : {}),
                ...(configuration.tokenPrefix != null ? { tokenPrefix: configuration.tokenPrefix } : {}),
                ...(scheme.docs != null ? { description: scheme.docs } : {})
            };
        }
        case "deviceCode":
            throw new Error(`SDK Config v1 cannot represent OAuth device-code Fern auth scheme ${scheme.key}`);
    }
}

function resolveEndpointUrl(ir: IntermediateRepresentation, reference: FernIr.EndpointReference): string {
    const service = ir.services[reference.serviceId];
    const endpoint = service?.endpoints.find((candidate) => candidate.id === reference.endpointId);
    if (endpoint == null) {
        throw new Error(`Cannot resolve Fern OAuth endpoint ${reference.endpointId}`);
    }
    if (endpoint.fullPath.parts.length > 0) {
        throw new Error(`SDK Config v1 cannot represent parameterized Fern OAuth endpoint ${reference.endpointId}`);
    }
    const { baseUrl } = mapEnvironments(ir);
    try {
        return new URL(endpoint.fullPath.head, baseUrl).toString();
    } catch (error) {
        throw new Error(`Cannot resolve an absolute URL for Fern OAuth endpoint ${reference.endpointId}`, {
            cause: error
        });
    }
}

function literalToString(literal: FernIr.Literal): string {
    switch (literal.type) {
        case "string":
            return literal.string;
        case "boolean":
            return String(literal.boolean);
    }
}

function collectAuthEnvironmentVariables(scheme: AuthScheme, variables: Set<string>): void {
    switch (scheme.type) {
        case "api-key":
        case "bearer":
            if (scheme.environmentVariable != null) {
                variables.add(scheme.environmentVariable);
            }
            return;
        case "basic":
            if (scheme.username?.environmentVariable != null) {
                variables.add(scheme.username.environmentVariable);
            }
            if (scheme.password?.environmentVariable != null) {
                variables.add(scheme.password.environmentVariable);
            }
            return;
        case "oauth2":
            if (scheme.clientId?.environmentVariable != null) {
                variables.add(scheme.clientId.environmentVariable);
            }
            if (scheme.clientSecret?.environmentVariable != null) {
                variables.add(scheme.clientSecret.environmentVariable);
            }
            return;
        case "custom":
            for (const parameter of scheme.parameters) {
                if (parameter.environmentVariable != null) {
                    variables.add(parameter.environmentVariable);
                }
            }
    }
}
