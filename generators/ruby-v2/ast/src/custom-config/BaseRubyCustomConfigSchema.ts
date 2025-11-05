import { z } from "zod";
import { CustomReadmeSectionSchema } from "./CustomReadmeSectionSchema";

export const BaseRubyCustomConfigSchema = z.object({
    module: z.optional(z.string()),
    clientModuleName: z.optional(z.string()),
    customReadmeSections: z.optional(z.array(CustomReadmeSectionSchema)),
    enableWireTests: z.optional(z.boolean())
});

export type BaseRubyCustomConfigSchema = z.infer<typeof BaseRubyCustomConfigSchema>;
