import { z } from "zod";

export const PackageMarkerFileSchema = z.strictObject({
    export: z.string(),
});

export type PackageMarkerFileSchema = z.infer<typeof PackageMarkerFileSchema>;
