import { z } from "zod";

export const GeneratorGroupDocsConfigurationSchema: z.ZodObject<
    {
        domain: z.ZodString;
        "custom-domains": z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    },
    "strict",
    z.ZodTypeAny,
    { domain: string; "custom-domains"?: string | Array<string> | undefined },
    { domain: string; "custom-domains"?: string | Array<string> | undefined }
> = z.strictObject({
    domain: z.string(),
    "custom-domains": z.optional(z.string().or(z.array(z.string())))
});

export type GeneratorGroupDocsConfigurationSchema = z.infer<typeof GeneratorGroupDocsConfigurationSchema>;
