import { z } from "zod";

export const GeneratorHelperReferenceSchema = z.strictObject({
    name: z.string(),
    version: z.string(),
    locationOnDisk: z.string().optional(),
});

export type GeneratorHelperReferenceSchema = z.infer<typeof GeneratorHelperReferenceSchema>;
