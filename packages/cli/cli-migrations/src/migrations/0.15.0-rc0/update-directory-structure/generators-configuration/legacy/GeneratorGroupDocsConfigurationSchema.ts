import { z } from "zod";

export const GeneratorGroupDocsConfigurationSchema = z.strictObject({
    domain: z.string(),
    "custom-domains": z.optional(z.string().or(z.array(z.string())))
});

export type GeneratorGroupDocsConfigurationSchema = z.infer<typeof GeneratorGroupDocsConfigurationSchema>;
