import { z } from "zod";
import { CustomReadmeSectionSchema } from "./CustomReadmeSectionSchema.js";

export const BasePhpCustomConfigSchema = z.object({
    clientName: z.string().optional(),
    inlinePathParameters: z.boolean().optional(),
    packageName: z.string().optional(),
    packagePath: z.string().optional(),
    propertyAccess: z.enum(["public", "private"]).optional(),
    namespace: z.string().optional(),
    composerJson: z.optional(z.record(z.any())),
    customReadmeSections: z.array(CustomReadmeSectionSchema).optional(),
    offsetSemantics: z.enum(["item-index", "page-index"]).optional(),
    omitFernHeaders: z.boolean().optional(),
    retryStatusCodes: z.optional(z.enum(["legacy", "recommended"])),
    // Deprecated; use clientName instead.
    "client-class-name": z.string().optional()
});

export type BasePhpCustomConfigSchema = z.infer<typeof BasePhpCustomConfigSchema>;
