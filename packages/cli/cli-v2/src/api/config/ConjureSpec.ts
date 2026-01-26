import type { schemas } from "@fern-api/config";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { ApiSpec } from "./ApiSpec";

/**
 * A Conjure API definition.
 */
export interface ConjureSpec {
    /** Path to the Conjure definition file */
    conjure: AbsoluteFilePath;

    /** Conjure-specific settings */
    settings?: schemas.ConjureSettingsSchema;
}

/**
 * Type guard to check if an ApiSpec is a ConjureSpec.
 */
export function isConjureSpec(spec: ApiSpec): spec is ConjureSpec {
    return "conjure" in spec;
}
