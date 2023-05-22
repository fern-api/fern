import { z } from "zod";
import { DefinitionFileSchema } from "./DefinitionFileSchema";

export const PackageMarkerFileSchema = DefinitionFileSchema.extend({
    export: z.optional(z.string()),
    navigation: z.optional(z.union([z.string(), z.array(z.string())])),
});

export type PackageMarkerFileSchema = z.infer<typeof PackageMarkerFileSchema>;
