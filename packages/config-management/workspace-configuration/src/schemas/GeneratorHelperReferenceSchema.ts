import { FilePath } from "@fern-api/core-utils";
import { z } from "zod";

export const GeneratorHelperReferenceSchema = z.strictObject({
    name: z.string(),
    version: z.string(),
    locationOnDisk: z.optional(z.string().transform(FilePath.of)),
});

export type GeneratorHelperReferenceSchema = z.infer<typeof GeneratorHelperReferenceSchema>;
