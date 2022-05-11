import { z } from "zod";
import { extendTypeDefinitionSchema } from "./TypeDefinitionSchema";

export const HttpRequestSchema = z.union([
    z.string(),
    extendTypeDefinitionSchema({
        encoding: z.optional(z.string()),
    }),
]);

export type HttpRequestSchema = z.infer<typeof HttpRequestSchema>;
