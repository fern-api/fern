import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../../getExtension";
import { FernOpenAPIExtension } from "./fernExtensions";

export interface OauthSchemeExtension {
    defaultScopes?: string[];
    tokenPrefix?: string;
    clientIdEnv?: string;
    clientSecretEnv?: string;
    authorizationCodeEnv?: string;
    redirectUri?: string;
}

export function getOauthSchemeExtensions(
    securityScheme: OpenAPIV3.SecuritySchemeObject
): OauthSchemeExtension | undefined {
    return getExtension<OauthSchemeExtension>(securityScheme, FernOpenAPIExtension.FERN_OAUTH);
}
