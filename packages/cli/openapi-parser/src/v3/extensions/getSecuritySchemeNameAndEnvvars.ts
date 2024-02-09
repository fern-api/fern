import { OpenAPIV3 } from "openapi-types";
import { FernOpenAPIExtension } from "./fernExtensions";
import { getExtension } from "./getExtension";

export interface SecuritySchemeNames {
    name?: string;
    envvar?: string;
}
export interface BasicSecuritySchemeNames {
    username?: SecuritySchemeNames;
    password?: SecuritySchemeNames;
}

export function getBasicSecuritySchemeNameAndEnvvar(openapi: OpenAPIV3.Document): BasicSecuritySchemeNames | undefined {
    return getExtension<BasicSecuritySchemeNames>(openapi, FernOpenAPIExtension.FERN_BASIC_AUTH);
}
