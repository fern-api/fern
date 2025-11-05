import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../../getExtension";
import { FernOpenAPIExtension } from "./fernExtensions";

export interface HeaderSecuritySchemeNames {
    name?: string;
    env?: string;
    prefix?: string;
}
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
