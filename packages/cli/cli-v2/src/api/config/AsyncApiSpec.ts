import type { schemas } from "@fern-api/config";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { ApiSpec } from "./ApiSpec";

/**
 * An AsyncAPI specification for event-driven APIs.
 */
export interface AsyncApiSpec {
    /** Path to the AsyncAPI specification file */
    asyncapi: AbsoluteFilePath;

    /** URL origin for fetching remote specs */
    origin?: string;

    /** Path to the overrides file */
    overrides?: AbsoluteFilePath;

    /** Namespace for the spec */
    namespace?: string;

    /** AsyncAPI-specific settings */
    settings?: schemas.AsyncApiSettingsSchema;
}

/**
 * Type guard to check if an ApiSpec is an AsyncApiSpec.
 */
export function isAsyncApiSpec(spec: ApiSpec): spec is AsyncApiSpec {
    return "asyncapi" in spec;
}
