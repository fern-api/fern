import { z } from "zod";

// https://redocly.com/docs/api-reference-docs/specification-extensions/x-code-samples/
export const RedoclyCodeSampleSchema: z.ZodObject<
    { lang: z.ZodString; label: z.ZodOptional<z.ZodString>; source: z.ZodString },
    "strip",
    z.ZodTypeAny,
    { lang: string; source: string; label?: string | undefined },
    { lang: string; source: string; label?: string | undefined }
> = z.object({
    lang: z.string(),
    label: z.optional(z.string()),
    source: z.string()
});

export type RedoclyCodeSampleSchema = z.infer<typeof RedoclyCodeSampleSchema>;

export const RedoclyCodeSampleArraySchema: z.ZodArray<
    z.ZodObject<
        { lang: z.ZodString; label: z.ZodOptional<z.ZodString>; source: z.ZodString },
        "strip",
        z.ZodTypeAny,
        { lang: string; source: string; label?: string | undefined },
        { lang: string; source: string; label?: string | undefined }
    >,
    "many"
> = z.array(RedoclyCodeSampleSchema);

export type RedoclyCodeSampleArraySchema = z.infer<typeof RedoclyCodeSampleArraySchema>;
