import type { schemas } from "@fern-api/config";

import type { ApiSpec } from "./ApiSpec.js";

/**
 * A logical API definition composed of one or more API specifications.
 * All specs in a definition are merged when generating IR.
 */
export interface ApiDefinition {
    /** The specs that compose this API definition */
    specs: ApiSpec[];
    /** Reference to the auth scheme (e.g. "BearerAuth") */
    auth?: string;
    /** Auth scheme declarations (e.g. oauth, bearer, basic, header) */
    authSchemes?: schemas.AuthSchemesSchema;
    /** Default URL when no environment is specified */
    defaultUrl?: string;
    /** Default environment name */
    defaultEnvironment?: string;
    /** Named environments */
    environments?: Record<string, schemas.EnvironmentSchema>;
    /** Global headers */
    headers?: Record<string, schemas.HeaderSchema>;
}
