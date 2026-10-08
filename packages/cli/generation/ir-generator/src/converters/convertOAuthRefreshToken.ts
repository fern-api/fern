import { RawSchemas } from "@fern-api/fern-definition-schema";
import { OAuthRefreshToken } from "@fern-api/ir-sdk";
import { CliError } from "@fern-api/task-context";

import { FernFileContext } from "../FernFileContext.js";
import { EndpointResolver } from "../resolvers/EndpointResolver.js";
import { PropertyResolver } from "../resolvers/PropertyResolver.js";
import { convertOAuthRefreshEndpoint } from "./convertOAuthRefreshEndpoint.js";
import { getRefreshTokenEndpoint } from "./convertOAuthUtils.js";

export function convertOAuthRefreshToken({
    propertyResolver,
    endpointResolver,
    file,
    oauthScheme
}: {
    propertyResolver: PropertyResolver;
    endpointResolver: EndpointResolver;
    file: FernFileContext;
    oauthScheme: RawSchemas.OAuthSchemeSchema;
}): OAuthRefreshToken {
    const refreshTokenEndpoint = getRefreshTokenEndpoint(oauthScheme);
    if (refreshTokenEndpoint == null) {
        throw new CliError({
            message: "OAuth refresh-token flow requires a `refresh-token` endpoint.",
            code: CliError.Code.ValidationError
        });
    }
    const refreshEndpoint = convertOAuthRefreshEndpoint({
        propertyResolver,
        endpointResolver,
        file,
        refreshTokenEndpoint
    });
    if (refreshEndpoint == null) {
        throw new CliError({
            message: "Failed to convert OAuth refresh-token endpoint.",
            code: CliError.Code.IrConversionError
        });
    }
    return {
        refreshTokenEnvVar: oauthScheme["refresh-token-env"],
        tokenPrefix: oauthScheme["token-prefix"],
        tokenHeader: oauthScheme["token-header"],
        refreshEndpoint
    };
}
