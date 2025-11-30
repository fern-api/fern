import { z } from "zod";
import { CustomReadmeSectionSchema } from "./CustomReadmeSectionSchema";
import { moduleConfigSchema } from "./ModuleConfigSchema";
import { relativePathSchema } from "./RelativePathSchema";

export const baseGoCustomConfigSchema = z.object({
    module: moduleConfigSchema.optional(),
    packageName: z.string().optional(),
    packagePath: relativePathSchema.optional(),
    importPath: relativePathSchema.optional(),

    alwaysSendRequiredProperties: z.boolean().optional(),
    clientConstructorName: z.string().optional(),
    clientName: z.string().optional(),
    enableExplicitNull: z.boolean().optional(),
    exportedClientName: z.string().optional(),
    includeLegacyClientOptions: z.boolean().optional(),
    inlinePathParameters: z.boolean().optional(),
    inlineFileProperties: z.boolean().optional(),
    union: z.enum(["v0", "v1"]).optional(),
    useReaderForBytesRequest: z.boolean().optional(),
    useDefaultRequestParameterValues: z.boolean().optional(),
    gettersPassByValue: z.boolean().optional(),
    enableWireTests: z.boolean().optional(),
    exportAllRequestsAtRoot: z.boolean().optional(),
    customReadmeSections: z.array(CustomReadmeSectionSchema).optional(),
    customPagerName: z.string().optional()
});

export type BaseGoCustomConfigSchema = z.infer<typeof baseGoCustomConfigSchema>;
