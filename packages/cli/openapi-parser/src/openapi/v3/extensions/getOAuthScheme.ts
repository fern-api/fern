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
    return getExtensionAndValidate<RefreshTokenEndpointSchema>(
        securityScheme,
        FernOpenAPIExtension.FERN_OAUTH_REFRESH_TOKEN_ENDPOINT,
        RefreshTokenEndpointSchema,
        context
    );
}

export function getAccessTokenConfiguration({
    securityScheme,
    context
}: {
    securityScheme: OpenAPIV3.SecuritySchemeObject;
    context: AbstractOpenAPIV3ParserContext;
}): AccessTokenEndpointSchema | undefined {
    return getExtensionAndValidate<AccessTokenEndpointSchema>(
        securityScheme,
        FernOpenAPIExtension.FERN_OAUTH_ACCESS_TOKEN_ENDPOINT,
        AccessTokenEndpointSchema,
        context
    );
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
