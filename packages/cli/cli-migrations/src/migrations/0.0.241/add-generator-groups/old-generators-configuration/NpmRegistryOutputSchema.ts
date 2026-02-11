import { z } from "zod";

export const NpmRegistryOutputSchema: z.ZodObject<
    { url: z.ZodOptional<z.ZodString>; "package-name": z.ZodString; token: z.ZodOptional<z.ZodString> },
    "strict",
    z.ZodTypeAny,
    { "package-name": string; url?: string | undefined; token?: string | undefined },
    { "package-name": string; url?: string | undefined; token?: string | undefined }
> = z.strictObject({
    url: z.optional(z.string()),
    "package-name": z.string(),
    token: z.optional(z.string())
});

export type NpmRegistryOutputSchema = z.infer<typeof NpmRegistryOutputSchema>;
