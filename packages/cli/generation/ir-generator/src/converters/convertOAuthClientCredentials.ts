import { OAuthClientCredentials } from "@fern-api/ir-sdk";
import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFileContext } from "../FernFileContext";
import { EndpointResolver } from "../resolvers/EndpointResolver";
import { PropertyResolver } from "../resolvers/PropertyResolver";
import { convertOAuthRefreshEndpoint } from "./convertOAuthRefreshEndpoint";
import { convertOAuthTokenEndpoint } from "./convertOAuthTokenEndpoint";
import { RefreshTokenEndpoint, TokenEndpoint } from "./convertOAuthUtils";

export async function convertOAuthClientCredentials({
    propertyResolver,
    endpointResolver,
    file,
    oauthScheme,
    tokenEndpoint,
    refreshTokenEndpoint
}: {
    propertyResolver: PropertyResolver;
    endpointResolver: EndpointResolver;
    file: FernFileContext;
    oauthScheme: RawSchemas.OAuthSchemeSchema;
    tokenEndpoint: TokenEndpoint;
    refreshTokenEndpoint: RefreshTokenEndpoint | undefined;
}): Promise<OAuthClientCredentials> {
    const oauthTokenEndpoint = await convertOAuthTokenEndpoint({
        propertyResolver,
        endpointResolver,
        file,
        tokenEndpoint
    });
    if (oauthTokenEndpoint == null) {
        throw new Error("Failed to convert OAuth token endpoint.");
    }
    const refreshEndpoint =
        refreshTokenEndpoint != null
            ? await convertOAuthRefreshEndpoint({
                  propertyResolver,
                  endpointResolver,
                  file,
                  refreshTokenEndpoint
              })
            : undefined;
    return {
        clientIdEnvVar: oauthScheme["client-id-env"],
        clientSecretEnvVar: oauthScheme["client-secret-env"],
        tokenPrefix: oauthScheme["token-prefix"],
        scopes: oauthScheme.scopes,
        tokenEndpoint: oauthTokenEndpoint,
        refreshEndpoint
    };
}
