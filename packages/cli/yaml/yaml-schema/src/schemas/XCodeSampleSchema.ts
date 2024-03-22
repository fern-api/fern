import { z } from "zod";

// https://redocly.com/docs/api-reference-docs/specification-extensions/x-code-samples/
export const XCodeSampleSchema = z.object({
    lang: z.string(),
    label: z.optional(z.string()),
    source: z.string()
});

export type XCodeSampleSchema = z.infer<typeof XCodeSampleSchema>;
