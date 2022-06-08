import { OpenAPIV3 } from "openapi-types";

export type OpenApiSecuritySchemes = {
    [key: string]: OpenAPIV3.ReferenceObject | OpenAPIV3.SecuritySchemeObject;
};
