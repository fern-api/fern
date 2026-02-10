import { z } from "zod";

/**
 * Controls the order of path parameters in generated method signatures.
 */
export const PathParameterOrderSchema = z.enum(["urlOrder", "specOrder"]);

export type PathParameterOrderSchema = z.infer<typeof PathParameterOrderSchema>;
