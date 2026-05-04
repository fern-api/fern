import { isInlineRequestBody, RawSchemas } from "@fern-api/fern-definition-schema";
import { OAuthTokenEndpoint } from "@fern-api/ir-sdk";

import { FernFileContext } from "../FernFileContext.js";
import { EndpointResolver } from "../resolvers/EndpointResolver.js";
import { PropertyResolver } from "../resolvers/PropertyResolver.js";
import { TypeResolver } from "../resolvers/TypeResolver.js";
import { createEndpointReference } from "../utils/createEndpointReference.js";
import { TokenEndpoint } from "./convertOAuthUtils.js";

export function convertOAuthTokenEndpoint({
    endpointResolver,
    propertyResolver,
    typeResolver,
    file,
    tokenEndpoint
}: {
    endpointResolver: EndpointResolver;
    propertyResolver: PropertyResolver;
    typeResolver: TypeResolver;
    file: FernFileContext;
    tokenEndpoint: TokenEndpoint;
}): OAuthTokenEndpoint | undefined {
    const resolvedEndpoint = endpointResolver.resolveEndpointOrThrow({
        endpoint: tokenEndpoint.endpoint,
        file
    });

    const requestBodyProperties = getRequestBodyPropertyNames({
        endpoint: resolvedEndpoint.endpoint,
        file: resolvedEndpoint.file,
        typeResolver
    });

    let expiresIn = undefined;
    try {
        expiresIn =
            tokenEndpoint.responseProperties.expires_in != null
                ? propertyResolver.resolveResponsePropertyOrThrow({
                      file,
                      endpoint: tokenEndpoint.endpoint,
                      propertyComponents: tokenEndpoint.responseProperties.expires_in
                  })
                : undefined;
        // biome-ignore lint/suspicious/noEmptyBlockStatements: allow
    } catch {}

    return {
        endpointReference: createEndpointReference({ resolvedEndpoint }),
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
                requestBodyPropertyNames: requestBodyProperties,
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
            expiresIn,
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
    requestBodyPropertyNames,
    tokenEndpoint,
    file,
    propertyResolver
}: {
    requestBodyPropertyNames: string[];
    tokenEndpoint: TokenEndpoint;
    file: FernFileContext;
    propertyResolver: PropertyResolver;
}) => {
    const customPropertyNames = requestBodyPropertyNames.filter(
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

/**
 * Extracts property names from the token endpoint's request body,
 * handling both inline request bodies and referenced type bodies.
 */
function getRequestBodyPropertyNames({
    endpoint,
    file,
    typeResolver
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): string[] {
    const request = endpoint.request;
    if (request == null) {
        return [];
    }

    // request can be a bare type reference string (shorthand)
    if (typeof request === "string") {
        return getPropertyNamesFromType({ typeName: request, file, typeResolver });
    }

    const body: RawSchemas.HttpRequestBodySchema | undefined = request.body;
    if (body == null) {
        return [];
    }

    // Bare string body (type reference)
    if (typeof body === "string") {
        return getPropertyNamesFromType({ typeName: body, file, typeResolver });
    }

    // Inline request body with explicit properties
    if (isInlineRequestBody(body)) {
        const names = Object.keys(body.properties ?? {});
        // Also include properties from extended types
        if (body.extends != null) {
            const extendsList = typeof body.extends === "string" ? [body.extends] : body.extends;
            for (const extendedType of extendsList) {
                names.push(...getPropertyNamesFromType({ typeName: extendedType, file, typeResolver }));
            }
        }
        return names;
    }

    // Referenced request body (has a `type` field)
    return getPropertyNamesFromType({ typeName: body.type, file, typeResolver });
}

function getPropertyNamesFromType({
    typeName,
    file,
    typeResolver
}: {
    typeName: string;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): string[] {
    const resolved = typeResolver.resolveType({ type: typeName, file });
    if (resolved == null || resolved._type !== "named") {
        return [];
    }
    const declaration = resolved.declaration;
    const names: string[] = [];
    if ("properties" in declaration && declaration.properties != null) {
        names.push(...Object.keys(declaration.properties));
    }
    if ("base-properties" in declaration && declaration["base-properties"] != null) {
        names.push(...Object.keys(declaration["base-properties"]));
    }
    return names;
}
