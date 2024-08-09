import { OpenAPIV3 } from "openapi-types";
import { getExtensionAndValidate } from "../../../getExtension";
import { AbstractOpenAPIV3ParserContext } from "../AbstractOpenAPIV3ParserContext";
import {
    AccessTokenEndpointSchema,
    FullOAuthConfigSchema,
    RefreshTokenEndpointSchema
} from "../schemas/OAuthConfigSchema";
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
              context
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
              context
          )
        : undefined;
}

export function getFullOAuthConfiguration({
    document,
    context
}: {
    document: OpenAPIV3.Document;
    context: AbstractOpenAPIV3ParserContext;
}): FullOAuthConfigSchema | undefined {
    return getExtensionAndValidate<FullOAuthConfigSchema>(
        document,
        FernOpenAPIExtension.FERN_OAUTH,
        FullOAuthConfigSchema,
        context
    );
}
