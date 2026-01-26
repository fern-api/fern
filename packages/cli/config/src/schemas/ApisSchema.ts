import { z } from "zod";
import { ApiDefinitionSchema } from "./ApiDefinitionSchema";

/**
 * The apis section of fern.yml contains named API definitions.
 * Each key is the API name, and the value is the API definition.
 */
export const ApisSchema = z.record(z.string(), ApiDefinitionSchema);

export type ApisSchema = z.infer<typeof ApisSchema>;
