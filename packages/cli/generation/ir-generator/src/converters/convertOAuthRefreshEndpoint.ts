import { OAuthRefreshEndpoint } from "@fern-api/ir-sdk";

import { FernFileContext } from "../FernFileContext";
import { IdGenerator } from "../IdGenerator";
import { EndpointResolver } from "../resolvers/EndpointResolver";
import { PropertyResolver } from "../resolvers/PropertyResolver";
import { isRootFernFilepath } from "../utils/isRootFernFilepath";
import { RefreshTokenEndpoint } from "./convertOAuthUtils";

export function convertOAuthRefreshEndpoint({
    endpointResolver,
    propertyResolver,
    file,
    refreshTokenEndpoint
}: {
    endpointResolver: EndpointResolver;
    propertyResolver: PropertyResolver;
    file: FernFileContext;
    refreshTokenEndpoint: RefreshTokenEndpoint;
}): OAuthRefreshEndpoint | undefined {
    const resolvedEndpoint = endpointResolver.resolveEndpointOrThrow({
        endpoint: refreshTokenEndpoint.endpoint,
        file
    });
    return {
        endpointReference: {
            endpointId: IdGenerator.generateEndpointIdFromResolvedEndpoint(resolvedEndpoint),
            serviceId: IdGenerator.generateServiceIdFromFernFilepath(resolvedEndpoint.file.fernFilepath),
            subpackageId: !isRootFernFilepath({ fernFilePath: resolvedEndpoint.file.fernFilepath })
                ? IdGenerator.generateSubpackageId(resolvedEndpoint.file.fernFilepath)
                : undefined
        },
        requestProperties: {
            refreshToken: propertyResolver.resolveRequestPropertyOrThrow({
                file,
                endpoint: refreshTokenEndpoint.endpoint,
                propertyComponents: refreshTokenEndpoint.requestProperties.refresh_token
            })
        },
        responseProperties: {
            accessToken: propertyResolver.resolveResponsePropertyOrThrow({
                file,
                endpoint: refreshTokenEndpoint.endpoint,
                propertyComponents: refreshTokenEndpoint.responseProperties.access_token
            }),
            expiresIn:
                refreshTokenEndpoint.responseProperties.expires_in != null
                    ? propertyResolver.resolveResponsePropertyOrThrow({
                          file,
                          endpoint: refreshTokenEndpoint.endpoint,
                          propertyComponents: refreshTokenEndpoint.responseProperties.expires_in
                      })
                    : undefined,
            refreshToken:
                refreshTokenEndpoint.responseProperties.refresh_token != null
                    ? propertyResolver.resolveResponsePropertyOrThrow({
                          file,
                          endpoint: refreshTokenEndpoint.endpoint,
                          propertyComponents: refreshTokenEndpoint.responseProperties.refresh_token
                      })
                    : undefined
        }
    };
}
