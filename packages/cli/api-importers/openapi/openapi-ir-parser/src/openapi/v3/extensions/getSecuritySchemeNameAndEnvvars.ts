import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../../getExtension.js";
import { FernOpenAPIExtension } from "./fernExtensions.js";

export interface HeaderSecuritySchemeNames {
    name?: string;
    env?: string;
    prefix?: string;
    placeholder?: string;
}
export interface SecuritySchemeNames {
    name?: string;
    env?: string;
    placeholder?: string;
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
