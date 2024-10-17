import { z } from "zod";

const BaseTypescriptCustomConfigSchema = z.object({
    noSerdeLayer: z.optional(z.boolean()),
    namespaceExport: z.optional(z.string())
});

export type BaseTypescriptCustomConfigSchema = z.infer<typeof BaseTypescriptCustomConfigSchema>;
