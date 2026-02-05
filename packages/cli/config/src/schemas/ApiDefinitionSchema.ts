import { z } from "zod";

import { ApiSpecSchema } from "./ApiSpecSchema";
import { AuthSchemesSchema } from "./AuthSchemesSchema";
import { EnvironmentSchema } from "./EnvironmentSchema";
import { HeaderSchema } from "./HeaderSchema";

/**
 * An API definition contains one or more specs that together define a single API.
 * All specs in a definition are merged when generating IR.
 *
 * Also supports API-level configuration for auth, environments, and headers.
 */
export const ApiDefinitionSchema = z.object({
    specs: z.array(ApiSpecSchema),
    auth: z.string().optional(),
    defaultUrl: z.string().optional(),
    defaultEnvironment: z.string().optional(),
    environments: z.record(z.string(), EnvironmentSchema).optional(),
    headers: z.record(z.string(), HeaderSchema).optional(),
    authSchemes: AuthSchemesSchema.optional()
});

export type ApiDefinitionSchema = z.infer<typeof ApiDefinitionSchema>;
