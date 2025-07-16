import { z } from "zod";

// https://redocly.com/docs/api-reference-docs/specification-extensions/x-code-samples/
export const RedoclyCodeSampleSchema = z.object({
    lang: z.string(),
    label: z.optional(z.string()),
    source: z.string()
});

export type RedoclyCodeSampleSchema = z.infer<typeof RedoclyCodeSampleSchema>;

export const RedoclyCodeSampleArraySchema = z.array(RedoclyCodeSampleSchema);

export type RedoclyCodeSampleArraySchema = z.infer<typeof RedoclyCodeSampleArraySchema>;
