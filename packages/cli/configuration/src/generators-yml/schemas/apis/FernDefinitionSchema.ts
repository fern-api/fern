import { z } from "zod";

/**
 * @example
 * fern: path to definition
 */
export const FernDefinitionSchema = z.strictObject({
    fern: z.string().describe("Path to the fern definition directory.")
});

export type FernDefinitionSchema = z.infer<typeof FernDefinitionSchema>;
