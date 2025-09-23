
import { assertNever } from "@fern-api/core-utils";
import { IrVersions } from "../../ir-versions";
import { convertName, convertNameAndWireValue } from "./convertCommons";
import { convertRequestProperty, convertResponseProperty, maybeConvertRequestProperty, maybeConvertResponseProperty } from "./convertHttp";
import { convertTypeReference } from "./convertTypes";

export function convertAuth(auth: IrVersions.V61.ApiAuth): IrVersions.V60.ApiAuth {
    return {
        ...auth,
        schemes: auth.schemes.map(convertAuthScheme)
    };
}

function convertAuthScheme(scheme: IrVersions.V61.AuthScheme): IrVersions.V60.AuthScheme {
    switch (scheme.type) {
        case "bearer":
            return IrVersions.V60.AuthScheme.bearer({
                ...scheme,
                token: convertName(scheme.token)
            });
        case "basic":
            return IrVersions.V60.AuthScheme.basic({
                ...scheme,
                username: convertName(scheme.username),
                password: convertName(scheme.password)
            });
        case "header":
            return IrVersions.V60.AuthScheme.header({
                ...scheme,
                name: convertNameAndWireValue(scheme.name),
                valueType: convertTypeReference(scheme.valueType)
            });
        case "oauth":
            return IrVersions.V60.AuthScheme.oauth({
                ...scheme,
                configuration: IrVersions.V60.OAuthConfiguration.clientCredentials({
                    ...scheme.configuration,
                    tokenEndpoint: {
                        ...scheme.configuration.tokenEndpoint,
                        requestProperties: {
                            clientId: convertRequestProperty(scheme.configuration.tokenEndpoint.requestProperties.clientId),
                            clientSecret: convertRequestProperty(scheme.configuration.tokenEndpoint.requestProperties.clientSecret),
                            scopes: maybeConvertRequestProperty(scheme.configuration.tokenEndpoint.requestProperties.scopes),
                            customProperties: scheme.configuration.tokenEndpoint.requestProperties.customProperties?.map(convertRequestProperty)
                        },
                        responseProperties: {
                            accessToken: convertResponseProperty(scheme.configuration.tokenEndpoint.responseProperties.accessToken),
                            expiresIn: maybeConvertResponseProperty(scheme.configuration.tokenEndpoint.responseProperties.expiresIn),
                            refreshToken: maybeConvertResponseProperty(scheme.configuration.tokenEndpoint.responseProperties.refreshToken)
                        }
                    },
                    refreshEndpoint: scheme.configuration.refreshEndpoint != null ? {
                        ...scheme.configuration.refreshEndpoint,
                        requestProperties: {
                            refreshToken: convertRequestProperty(scheme.configuration.refreshEndpoint.requestProperties.refreshToken)
                        },
                        responseProperties: {
                            accessToken: convertResponseProperty(scheme.configuration.refreshEndpoint.responseProperties.accessToken),
                            expiresIn: maybeConvertResponseProperty(scheme.configuration.refreshEndpoint.responseProperties.expiresIn),
                            refreshToken: maybeConvertResponseProperty(scheme.configuration.refreshEndpoint.responseProperties.refreshToken)
                        }
                    } : undefined
                })
            });
        case "inferred":
            return IrVersions.V60.AuthScheme.inferred({
                ...scheme,
                tokenEndpoint: {
                    ...scheme.tokenEndpoint,
                    expiryProperty: maybeConvertResponseProperty(scheme.tokenEndpoint.expiryProperty),
                    authenticatedRequestHeaders: scheme.tokenEndpoint.authenticatedRequestHeaders.map(header => ({
                        ...header,
                        responseProperty: convertResponseProperty(header.responseProperty)
                    }))
                }
            });
        default:
            return assertNever(scheme);
    }
}