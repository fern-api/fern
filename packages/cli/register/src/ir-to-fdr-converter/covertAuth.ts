import { assertNever } from "@fern-api/core-utils";
import { FernIr as Ir } from "@fern-api/ir-sdk";
import { FernRegistry as FdrCjsSdk } from "@fern-fern/fdr-cjs-sdk";
import { PlaygroundConfig } from "@fern-fern/fdr-cjs-sdk/api/resources/docs/resources/v1/resources/commons";

export function convertAuth(
    auth: Ir.auth.ApiAuth,
    ir: Ir.ir.IntermediateRepresentation,
    playgroundConfig?: PlaygroundConfig
): FdrCjsSdk.api.v1.register.ApiAuth | undefined {
    const scheme = auth.schemes[0];
    if (auth.schemes.length === 1 && scheme != null) {
        switch (scheme.type) {
            case "basic":
                return {
                    type: "basicAuth",
                    passwordName: scheme.password.originalName,
                    usernameName: scheme.username.originalName
                };
            case "bearer":
                return {
                    type: "bearerAuth",
                    tokenName: scheme.token.originalName
                };
            case "header":
                return {
                    type: "header",
                    headerWireValue: scheme.name.wireValue,
                    nameOverride: scheme.name.name.originalName,
                    prefix: scheme.prefix
                };
            case "oauth": {
                // We have to do the following, since the id passed on resolved endpoints is originalName
                let endpointId = scheme.configuration.tokenEndpoint.endpointReference.endpointId;
                for (const irService of Object.values(ir.services)) {
                    for (const irEndpoint of irService.endpoints) {
                        if (irEndpoint.id === scheme.configuration.tokenEndpoint.endpointReference.endpointId) {
                            endpointId = irEndpoint.name.originalName;
                        }
                    }
                }
                return playgroundConfig?.oauth
                    ? {
                          type: "oAuth",
                          value: {
                              type: "clientCredentials",
                              value: {
                                  type: "referencedEndpoint",
                                  endpointId,
                                  accessTokenLocator:
                                      scheme.configuration.tokenEndpoint.responseProperties.accessToken.propertyPath
                                          ?.map((p) => p.originalName)
                                          .join(".") ?? ""
                              }
                          }
                      }
                    : {
                          type: "bearerAuth",
                          tokenName: "token"
                      };
            }
            default:
                assertNever(scheme);
        }
    }
    return undefined;
}
