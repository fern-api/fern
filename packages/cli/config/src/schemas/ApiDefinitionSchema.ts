import { z } from "zod";
import { ApiSpecSchema } from "./ApiSpecSchema";

/**
 * An API definition contains one or more specs that together define a single API.
 * All specs in a definition are merged when generating IR.
 */
export const ApiDefinitionSchema = z.object({
    specs: z.array(ApiSpecSchema)
});

export type ApiDefinitionSchema = z.infer<typeof ApiDefinitionSchema>;
