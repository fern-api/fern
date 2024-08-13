import { OpenAPIV3 } from "openapi-types";
import { getExtensionAndValidate } from "../../../getExtension";
import { AbstractOpenAPIV3ParserContext } from "../AbstractOpenAPIV3ParserContext";
import { AccessTokenEndpointSchema, RefreshTokenEndpointSchema } from "../schemas/OAuthConfigSchema";
import { FernOpenAPIExtension } from "./fernExtensions";

export function getRefreshTokenConfiguration({
    securityScheme,
    context
}: {
    securityScheme: OpenAPIV3.SecuritySchemeObject;
    context: AbstractOpenAPIV3ParserContext;
}): RefreshTokenEndpointSchema | undefined {
    return securityScheme.type === "oauth2" && securityScheme.flows.clientCredentials != null
        ? getExtensionAndValidate<RefreshTokenEndpointSchema>(
              securityScheme.flows.clientCredentials,
              FernOpenAPIExtension.FERN_OAUTH_REFRESH_TOKEN_ENDPOINT,
              RefreshTokenEndpointSchema,
              context.logger
          )
        : undefined;
}

export function getAccessTokenConfiguration({
    securityScheme,
    context
}: {
    securityScheme: OpenAPIV3.SecuritySchemeObject;
    context: AbstractOpenAPIV3ParserContext;
}): AccessTokenEndpointSchema | undefined {
    return securityScheme.type === "oauth2" && securityScheme.flows.clientCredentials != null
        ? getExtensionAndValidate<AccessTokenEndpointSchema>(
              securityScheme.flows.clientCredentials,
              FernOpenAPIExtension.FERN_OAUTH_ACCESS_TOKEN_ENDPOINT,
              AccessTokenEndpointSchema,
              context.logger
          )
        : undefined;
}
