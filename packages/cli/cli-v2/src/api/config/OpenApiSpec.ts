import type { schemas } from "@fern-api/config";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { ApiSpec } from "./ApiSpec";

/**
 * An OpenAPI specification (OpenAPI 3.x).
 */
export interface OpenApiSpec {
    /** Path to the OpenAPI specification file */
    openapi: AbsoluteFilePath;

    /** URL origin for fetching remote specs */
    origin?: string;

    /** Path to the overrides file */
    overrides?: AbsoluteFilePath;

    /** Path to the overlays file */
    overlays?: AbsoluteFilePath;

    /** Namespace for the spec */
    namespace?: string;

    /** OpenAPI-specific settings */
    settings?: schemas.OpenApiSettingsSchema;
}

/**
 * Type guard to check if an ApiSpec is an OpenApiSpec.
 */
export function isOpenApiSpec(spec: ApiSpec): spec is OpenApiSpec {
    return "openapi" in spec;
}
