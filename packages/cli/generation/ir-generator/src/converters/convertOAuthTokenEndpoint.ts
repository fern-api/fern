import { OAuthTokenEndpoint } from "@fern-api/ir-sdk";
import { FernFileContext } from "../FernFileContext";
import { IdGenerator } from "../IdGenerator";
import { EndpointResolver } from "../resolvers/EndpointResolver";
import { PropertyResolver } from "../resolvers/PropertyResolver";
import { TokenEndpoint } from "./convertOAuthUtils";

export async function convertOAuthTokenEndpoint({
    endpointResolver,
    propertyResolver,
    file,
    tokenEndpoint
}: {
    endpointResolver: EndpointResolver;
    propertyResolver: PropertyResolver;
    file: FernFileContext;
    tokenEndpoint: TokenEndpoint;
}): Promise<OAuthTokenEndpoint | undefined> {
    const resolvedEndpoint = endpointResolver.resolveEndpointOrThrow({
        endpoint: tokenEndpoint.endpoint,
        file
    });
    return {
        endpointReference: IdGenerator.generateEndpointIdFromResolvedEndpoint(resolvedEndpoint),
        responseProperties: {
            accessToken: await propertyResolver.resolveResponsePropertyOrThrow({
                file,
                endpoint: tokenEndpoint.endpoint,
                propertyComponents: tokenEndpoint.responseProperties.access_token
            }),
            expiresIn:
                tokenEndpoint.responseProperties.expires_in != null
                    ? await propertyResolver.resolveResponsePropertyOrThrow({
                          file,
                          endpoint: tokenEndpoint.endpoint,
                          propertyComponents: tokenEndpoint.responseProperties.expires_in
                      })
                    : undefined,
            refreshToken:
                tokenEndpoint.responseProperties.refresh_token != null
                    ? await propertyResolver.resolveResponsePropertyOrThrow({
                          file,
                          endpoint: tokenEndpoint.endpoint,
                          propertyComponents: tokenEndpoint.responseProperties.refresh_token
                      })
                    : undefined
        }
    };
}
