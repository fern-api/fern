import { OpenAPIV3 } from "openapi-types";
import { FernOpenAPIExtension } from "./fernExtensions";
import { getExtension } from "./getExtension";

export interface SecuritySchemeNames {
    name?: string;
    env?: string;
}
export interface BasicSecuritySchemeNames {
    username?: SecuritySchemeNames;
    password?: SecuritySchemeNames;
}

export function getBasicSecuritySchemeNameAndEnvvar(
    securityScheme: OpenAPIV3.SecuritySchemeObject
): BasicSecuritySchemeNames | undefined {
    return getExtension<BasicSecuritySchemeNames>(securityScheme, FernOpenAPIExtension.FERN_BASIC_AUTH);
}
