import { z } from "zod";
import { ServiceFileSchema } from "./ServiceFileSchema";

export const PackageMarkerFileSchema = ServiceFileSchema.extend({
    export: z.optional(z.string()),
});

export type PackageMarkerFileSchema = z.infer<typeof PackageMarkerFileSchema>;
