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
    // Opt-in: when the API composes OAuth client-credentials with basic auth
    // (`auth: any`), auth credentials passed explicitly to the client constructor
    // take precedence over environment-variable defaults when selecting the auth
    // scheme. Disabled by default so existing output is unchanged (OAuth env vars
    // win over explicitly provided basic auth).
    preferExplicitAuth: z.boolean().optional(),
    includePlatformHeaders: z.boolean().optional(),
    allowUserAgentAppInfo: z.boolean().optional(),
    retryStatusCodes: z.optional(z.enum(["legacy", "recommended"])),
    // Deprecated; use clientName instead.
    "client-class-name": z.string().optional()
});

export type BasePhpCustomConfigSchema = z.infer<typeof BasePhpCustomConfigSchema>;
