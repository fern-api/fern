import { OAuthTokenEndpoint } from "@fern-api/ir-sdk";

import { FernFileContext } from "../FernFileContext";
import { IdGenerator } from "../IdGenerator";
import { EndpointResolver } from "../resolvers/EndpointResolver";
import { PropertyResolver } from "../resolvers/PropertyResolver";
import { isRootFernFilepath } from "../utils/isRootFernFilepath";
import { TokenEndpoint } from "./convertOAuthUtils";

export function convertOAuthTokenEndpoint({
    endpointResolver,
    propertyResolver,
    file,
    tokenEndpoint
}: {
    endpointResolver: EndpointResolver;
    propertyResolver: PropertyResolver;
    file: FernFileContext;
    tokenEndpoint: TokenEndpoint;
}): OAuthTokenEndpoint | undefined {
    const resolvedEndpoint = endpointResolver.resolveEndpointOrThrow({
        endpoint: tokenEndpoint.endpoint,
        file
    });

    const requestBodyProperties =
        typeof resolvedEndpoint.endpoint.request === "object" &&
        resolvedEndpoint.endpoint.request.body != null &&
        typeof resolvedEndpoint.endpoint.request.body === "object" &&
        "properties" in resolvedEndpoint.endpoint.request.body
            ? (resolvedEndpoint.endpoint.request.body.properties ?? {})
            : {};

    return {
        endpointReference: {
            endpointId: IdGenerator.generateEndpointIdFromResolvedEndpoint(resolvedEndpoint),
            serviceId: IdGenerator.generateServiceIdFromFernFilepath(resolvedEndpoint.file.fernFilepath),
            subpackageId: !isRootFernFilepath({ fernFilePath: resolvedEndpoint.file.fernFilepath })
                ? IdGenerator.generateSubpackageId(resolvedEndpoint.file.fernFilepath)
                : undefined
        },
        requestProperties: {
            clientId: propertyResolver.resolveRequestPropertyOrThrow({
                file,
                endpoint: tokenEndpoint.endpoint,
                propertyComponents: tokenEndpoint.requestProperties.client_id
            }),
            clientSecret: propertyResolver.resolveRequestPropertyOrThrow({
                file,
                endpoint: tokenEndpoint.endpoint,
                propertyComponents: tokenEndpoint.requestProperties.client_secret
            }),
            scopes:
                tokenEndpoint.requestProperties.scopes != null
                    ? propertyResolver.resolveRequestPropertyOrThrow({
                          file,
                          endpoint: tokenEndpoint.endpoint,
                          propertyComponents: tokenEndpoint.requestProperties.scopes
                      })
                    : undefined,
            customProperties: resolveCustomRequestProperties({
                requestBodyProperties,
                tokenEndpoint,
                file,
                propertyResolver
            })
        },
        responseProperties: {
            accessToken: propertyResolver.resolveResponsePropertyOrThrow({
                file,
                endpoint: tokenEndpoint.endpoint,
                propertyComponents: tokenEndpoint.responseProperties.access_token
            }),
            expiresIn:
                tokenEndpoint.responseProperties.expires_in != null
                    ? propertyResolver.resolveResponsePropertyOrThrow({
                          file,
                          endpoint: tokenEndpoint.endpoint,
                          propertyComponents: tokenEndpoint.responseProperties.expires_in
                      })
                    : undefined,
            refreshToken:
                tokenEndpoint.responseProperties.refresh_token != null
                    ? propertyResolver.resolveResponsePropertyOrThrow({
                          file,
                          endpoint: tokenEndpoint.endpoint,
                          propertyComponents: tokenEndpoint.responseProperties.refresh_token
                      })
                    : undefined
        }
    };
}

const resolveCustomRequestProperties = ({
    requestBodyProperties,
    tokenEndpoint,
    file,
    propertyResolver
}: {
    requestBodyProperties: Record<string, unknown>;
    tokenEndpoint: TokenEndpoint;
    file: FernFileContext;
    propertyResolver: PropertyResolver;
}) => {
    const customPropertyNames = Object.keys(requestBodyProperties).filter(
        (propertyName) =>
            !tokenEndpoint.requestProperties.client_id.includes(propertyName) &&
            !tokenEndpoint.requestProperties.client_secret.includes(propertyName) &&
            (tokenEndpoint.requestProperties.scopes == null ||
                !tokenEndpoint.requestProperties.scopes.includes(propertyName))
    );

    return customPropertyNames.length > 0
        ? customPropertyNames.map((propertyName) =>
              propertyResolver.resolveRequestPropertyOrThrow({
                  file,
                  endpoint: tokenEndpoint.endpoint,
                  propertyComponents: [propertyName]
              })
          )
        : undefined;
};
