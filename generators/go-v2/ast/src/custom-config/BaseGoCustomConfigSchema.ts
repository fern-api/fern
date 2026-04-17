import { z } from "zod";
import { CustomReadmeSectionSchema } from "./CustomReadmeSectionSchema.js";
import { moduleConfigSchema } from "./ModuleConfigSchema.js";
import { relativePathSchema } from "./RelativePathSchema.js";

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
    // TODO(next-major): flip default to true.
    //
    // When true, generated client methods surface each endpoint's `availability`
    // from the IR as a Go doc comment (e.g. `// Deprecated: ...` for DEPRECATED
    // and `// @beta ...` for IN_DEVELOPMENT / PRE_RELEASE). Gated behind a flag
    // because staticcheck/SA1019 treats `// Deprecated:` as a warning, which
    // breaks downstream builds that compile with warnings-as-errors.
    generateEndpointAvailability: z.boolean().optional(),
    includeLegacyClientOptions: z.boolean().optional(),
    inlinePathParameters: z.boolean().optional(),
    inlineFileProperties: z.boolean().optional(),
    omitEmptyRequestWrappers: z.boolean().optional(),
    union: z.enum(["v0", "v1"]).optional(),
    useReaderForBytesRequest: z.boolean().optional(),
    useDefaultRequestParameterValues: z.boolean().optional(),
    gettersPassByValue: z.boolean().optional(),
    enableWireTests: z.boolean().optional(),
    exportAllRequestsAtRoot: z.boolean().optional(),
    customReadmeSections: z.array(CustomReadmeSectionSchema).optional(),
    customPagerName: z.string().optional(),
    omitFernHeaders: z.boolean().optional(),
    maxRetries: z.number().int().min(0).optional()
});

export type BaseGoCustomConfigSchema = z.infer<typeof baseGoCustomConfigSchema>;
