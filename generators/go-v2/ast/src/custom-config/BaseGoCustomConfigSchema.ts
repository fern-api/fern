import { z } from "zod";
import { CustomReadmeSectionSchema } from "./CustomReadmeSectionSchema.js";
import { moduleConfigSchema } from "./ModuleConfigSchema.js";
import { relativePathSchema } from "./RelativePathSchema.js";
import { timeoutsConfigSchema } from "./TimeoutsConfigSchema.js";

export const baseGoCustomConfigSchema = z.strictObject({
    module: moduleConfigSchema.optional(),
    packageName: z.string().optional(),
    packagePath: relativePathSchema.optional(),
    importPath: relativePathSchema.optional(),

    alwaysSendRequiredProperties: z.boolean().optional(),
    clientConstructorName: z.string().optional(),
    clientName: z.string().optional(),
    enableExplicitNull: z.boolean().optional(),
    errorCodes: z.enum(["per-endpoint", "global"]).optional(),
    exportedClientName: z.string().optional(),
    includeLegacyClientOptions: z.boolean().optional(),
    inlinePathParameters: z.boolean().optional(),
    inlineFileProperties: z.boolean().optional(),
    omitEmptyRequestWrappers: z.boolean().optional(),
    union: z.enum(["v0", "v1"]).optional(),
    useReaderForBytesRequest: z.boolean().optional(),
    useDefaultRequestParameterValues: z.boolean().optional(),
    gettersPassByValue: z.boolean().optional(),
    dedupeUnionBaseProperties: z.boolean().optional(),
    serverUrlVariables: z.boolean().optional(),
    enableWireTests: z.boolean().optional(),
    exportAllRequestsAtRoot: z.boolean().optional(),
    customReadmeSections: z.array(CustomReadmeSectionSchema).optional(),
    customPagerName: z.string().optional(),
    offsetSemantics: z.enum(["item-index", "page-index"]).optional(),
    omitFernHeaders: z.boolean().optional(),
    includePlatformHeaders: z.boolean().optional(),
    maxRetries: z.number().int().min(0).optional(),
    retryStatusCodes: z.optional(z.enum(["legacy", "recommended"])),
    // Optional, additive per-phase HTTP timeouts (connect/read/write, in
    // seconds). The default HTTP client construction is handled by the Go v1
    // generator (core/request_option.go); v2 accepts the field here so its
    // strict config validation does not reject it.
    timeouts: timeoutsConfigSchema.optional()
});

export type BaseGoCustomConfigSchema = z.infer<typeof baseGoCustomConfigSchema>;
