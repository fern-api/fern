import type { schemas } from "@fern-api/config";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { ApiSpec } from "./ApiSpec";

/**
 * A native Fern definition.
 *
 * Points to the root directory containing Fern definition files
 * (api.yml, types, endpoints, etc.).
 */
export interface FernSpec {
    /** Path to the Fern definition directory */
    fern: AbsoluteFilePath;

    /** Fern-specific settings */
    settings?: schemas.FernSettingsSchema;
}

/**
 * Type guard to check if an ApiSpec is a FernSpec.
 */
export function isFernSpec(spec: ApiSpec): spec is FernSpec {
    return "fern" in spec;
}
