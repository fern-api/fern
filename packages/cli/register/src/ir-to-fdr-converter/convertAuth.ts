import { assertNever } from '@fern-api/core-utils'
import { FernIr as Ir } from '@fern-api/ir-sdk'

import { FernRegistry as FdrCjsSdk } from '@fern-fern/fdr-cjs-sdk'

export interface PlaygroundConfig {
    oauth?: boolean
}

export function convertAuth(
    auth: Ir.auth.ApiAuth,
    ir: Ir.ir.IntermediateRepresentation,
    playgroundConfig?: PlaygroundConfig
): FdrCjsSdk.api.v1.register.ApiAuth | undefined {
    if (auth.schemes.length > 0 && auth.schemes[0] != null) {
        const scheme = auth.schemes[0]
        switch (scheme.type) {
            case 'basic':
                return {
                    type: 'basicAuth',
                    passwordName: scheme.password.originalName,
                    usernameName: scheme.username.originalName,
                    description: auth.docs
                }
            case 'bearer':
                return {
                    type: 'bearerAuth',
                    tokenName: scheme.token.originalName,
                    description: auth.docs
                }
            case 'header':
                return {
                    type: 'header',
                    headerWireValue: scheme.name.wireValue,
                    nameOverride: scheme.name.name.originalName,
                    prefix: scheme.prefix,
                    description: auth.docs
                }
            case 'oauth': {
                const tokenPath =
                    scheme.configuration.tokenEndpoint.responseProperties.accessToken.propertyPath
                        ?.map((p) => p.originalName)
                        .join('.') || '$.body.access_token'

                return playgroundConfig?.oauth
                    ? {
                          type: 'oAuth',
                          value: {
                              type: 'clientCredentials',
                              value: {
                                  type: 'referencedEndpoint',
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
                          type: 'bearerAuth',
                          tokenName: 'token',
                          description: auth.docs
                      }
            }
            default:
                assertNever(scheme)
        }
    }
    return undefined
}
