import { FilePath } from "@fern-api/core-utils";
import { z } from "zod";

export const GenerateConfigSchema = z.strictObject({
    enabled: z.literal(true),
    output: z.optional(z.string().transform(FilePath.of)),
});

export type GenerateConfigSchema = z.infer<typeof GenerateConfigSchema>;
