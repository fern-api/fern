import { OpenAPIV3_1 } from "openapi-types";

export interface OpenApiValidationOptions {
    strict?: boolean;
    allowExtensions?: boolean;
    validateExamples?: boolean;
    validateSchemas?: boolean;
}

export type OpenApiDocument = OpenAPIV3_1.Document;
