import { OpenAPIV3 } from "openapi-types";
import { X_FERN_PASSWORD_VARIABLE_NAME, X_FERN_USERNAME_VARIABLE_NAME } from "./extensions";

export interface BasicSecuritySchemeNames {
    usernameVariable?: string;
    passwordVariable?: string;
}

export function getBasicSecuritySchemeNames(securityScheme: OpenAPIV3.SecuritySchemeObject): BasicSecuritySchemeNames {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const usernameVariable = (securityScheme as any)[X_FERN_USERNAME_VARIABLE_NAME] as undefined | string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const passwordVariable = (securityScheme as any)[X_FERN_PASSWORD_VARIABLE_NAME] as undefined | string;

    return {
        usernameVariable,
        passwordVariable,
    };
}
