import { z } from "zod";

export const GeneratorGroupDocsConfigurationSchema = z.strictObject({
    domain: z.string(),
});

export type GeneratorGroupDocsConfigurationSchema = z.infer<typeof GeneratorGroupDocsConfigurationSchema>;
