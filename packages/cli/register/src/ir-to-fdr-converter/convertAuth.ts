import { assertNever } from "@fern-api/core-utils";
import { FernRegistry as FdrCjsSdk } from "@fern-api/fdr-sdk";
import { FernIr as Ir } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";

export interface PlaygroundConfig {
    oauth?: boolean;
}

export function convertAuth({
    auth,
    playgroundConfig,
    context
}: {
    auth: Ir.auth.ApiAuth;
    playgroundConfig?: PlaygroundConfig;
    context: TaskContext;
}): FdrCjsSdk.api.v1.register.ApiAuth | undefined {
    if (auth.schemes.length > 0 && auth.schemes[0] != null) {
        const scheme = auth.schemes[0];
        return convertAuthScheme({ scheme, playgroundConfig, context });
    }
    return undefined;
}

function convertAuthScheme({
    scheme,
    playgroundConfig,
    context
}: {
    scheme: Ir.auth.AuthScheme;
    playgroundConfig?: PlaygroundConfig;
    context: TaskContext;
}): FdrCjsSdk.api.v1.register.ApiAuth | undefined {
    switch (scheme.type) {
        case "basic":
            return {
                type: "basicAuth",
                passwordName: scheme.password.originalName,
                usernameName: scheme.username.originalName,
                description: scheme.docs
            };
        case "bearer":
            return {
                type: "bearerAuth",
                tokenName: scheme.token.originalName,
                description: scheme.docs
            };
        case "header":
            return {
                type: "header",
                headerWireValue: scheme.name.wireValue,
                nameOverride: scheme.name.name.originalName,
                prefix: scheme.prefix,
                description: scheme.docs
            };
        case "oauth": {
            const tokenPath =
                scheme.configuration.tokenEndpoint.responseProperties.accessToken.propertyPath
                    ?.map((p) => p.name.originalName)
                    .join(".") || "$.body.access_token";

            return playgroundConfig?.oauth
                ? {
                      type: "oAuth",
                      value: {
                          type: "clientCredentials",
                          value: {
                              type: "referencedEndpoint",
                              endpointId: FdrCjsSdk.EndpointId(
                                  scheme.configuration.tokenEndpoint.endpointReference.endpointId
                              ),
                              accessTokenLocator: FdrCjsSdk.JqString(tokenPath),
                              headerName: scheme.configuration.tokenHeader,
                              tokenPrefix: scheme.configuration.tokenPrefix,
                              description: scheme.docs
                          }
                      }
                  }
                : {
                      type: "bearerAuth",
                      tokenName: "token",
                      description: scheme.docs
                  };
        }
        case "inferred": {
            if (scheme.tokenEndpoint.authenticatedRequestHeaders.length > 1) {
                context.logger.warn(
                    "Inferred auth scheme has multiple authenticated request headers. Only the `Authentication` or first header will be pushed to FDR."
                );
            }
            const authHeader = scheme.tokenEndpoint.authenticatedRequestHeaders.find(
                (h) => h.headerName.toLowerCase() === "authorization"
            );
            if (authHeader) {
                if (
                    authHeader.responseProperty.propertyPath != null &&
                    authHeader.responseProperty.propertyPath.length > 0
                ) {
                    context.logger.warn(
                        "Inferred Authentication header has a property path. The property wirevalue will be pushed to FDR without property path."
                    );
                }
                return {
                    type: "bearerAuth",
                    tokenName: authHeader.responseProperty.property.name.wireValue,
                    description: scheme.docs
                };
            }
            const firstHeader = scheme.tokenEndpoint.authenticatedRequestHeaders[0];
            if (firstHeader) {
                return {
                    type: "header",
                    headerWireValue: firstHeader.headerName,
                    prefix: firstHeader.valuePrefix,
                    nameOverride: undefined,
                    description: scheme.docs
                };
            }
            return {
                type: "bearerAuth",
                tokenName: "token",
                description: scheme.docs
            };
        }
        default:
            assertNever(scheme);
    }
}

export function convertAllAuthSchemes({
    auth,
    playgroundConfig,
    context
}: {
    auth: Ir.auth.ApiAuth;
    playgroundConfig?: PlaygroundConfig;
    context: TaskContext;
}): Record<FdrCjsSdk.AuthSchemeId, FdrCjsSdk.api.v1.register.ApiAuth> {
    const authSchemes: Record<FdrCjsSdk.AuthSchemeId, FdrCjsSdk.api.v1.register.ApiAuth> = {};

    for (const scheme of auth.schemes) {
        const convertedAuth = convertAuthScheme({ scheme, playgroundConfig, context });
        if (convertedAuth != null) {
            authSchemes[FdrCjsSdk.AuthSchemeId(scheme.key)] = convertedAuth;
        }
    }

    return authSchemes;
}
