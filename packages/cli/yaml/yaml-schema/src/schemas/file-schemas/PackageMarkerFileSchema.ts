import { z } from "zod";
import { DefinitionFileSchema } from "./DefinitionFileSchema";

export const ExportSchema = z.object({
    dependency: z.string(),
    url: z.optional(z.string())
});

export type ExportSchema = z.infer<typeof ExportSchema>;

export const PackageMarkerFileSchema = DefinitionFileSchema.extend({
    export: z.optional(z.union([z.string(), ExportSchema])),
    navigation: z.optional(z.union([z.string(), z.array(z.string())]))
});

export type PackageMarkerFileSchema = z.infer<typeof PackageMarkerFileSchema>;
