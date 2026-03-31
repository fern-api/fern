import { z } from "zod";

/**
 * Controls when to remove discriminant properties from schemas.
 */
export const RemoveDiscriminantsFromSchemasSchema = z.enum(["always", "never"]);

export type RemoveDiscriminantsFromSchemasSchema = z.infer<typeof RemoveDiscriminantsFromSchemasSchema>;
