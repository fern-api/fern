import type { ApiSpec } from "./ApiSpec";

/**
 * A logical API definition composed of one or more API specifications.
 * All specs in a definition are merged when generating IR.
 */
export interface ApiDefinition {
    /** The specs that compose this API definition */
    specs: ApiSpec[];

    // TODO: Add support for auth schemes and other API configuration.
}
