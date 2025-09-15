import { assertNever } from "@fern-api/core-utils";
import { FernIr as Ir } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";

import { FernRegistry as FdrCjsSdk } from "@fern-fern/fdr-cjs-sdk";

export interface PlaygroundConfig {
    oauth?: boolean;
}

export function convertAuth({
    auth,
    ir,
    playgroundConfig,
    context
}: {
    auth: Ir.auth.ApiAuth;
    ir: Ir.ir.IntermediateRepresentation;
    playgroundConfig?: PlaygroundConfig;
    context: TaskContext;
}): FdrCjsSdk.api.v1.register.ApiAuth | undefined {
    if (auth.schemes.length > 0 && auth.schemes[0] != null) {
        const scheme = auth.schemes[0];
        switch (scheme.type) {
            case "basic":
                return {
                    type: "basicAuth",
                    passwordName: scheme.password.originalName,
                    usernameName: scheme.username.originalName,
                    description: auth.docs
                };
            case "bearer":
                return {
                    type: "bearerAuth",
                    tokenName: scheme.token.originalName,
                    description: auth.docs
                };
            case "header":
                return {
                    type: "header",
                    headerWireValue: scheme.name.wireValue,
                    nameOverride: scheme.name.name.originalName,
                    prefix: scheme.prefix,
                    description: auth.docs
                };
            case "oauth": {
                const tokenPath =
                    scheme.configuration.tokenEndpoint.responseProperties.accessToken.propertyPath
                        ?.map((p) => p.originalName)
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
                                  description: auth.docs
                              }
                          }
                      }
                    : {
                          type: "bearerAuth",
                          tokenName: "token",
                          description: auth.docs
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
                        description: auth.docs
                    };
                }
                const firstHeader = scheme.tokenEndpoint.authenticatedRequestHeaders[0];
                if (firstHeader) {
                    return {
                        type: "header",
                        headerWireValue: firstHeader.headerName,
                        prefix: firstHeader.valuePrefix,
                        nameOverride: undefined,
                        description: auth.docs
                    };
                }
                return {
                    type: "bearerAuth",
                    tokenName: "token",
                    description: auth.docs
                };
            }
            default:
                assertNever(scheme);
        }
    }
    return undefined;
}
