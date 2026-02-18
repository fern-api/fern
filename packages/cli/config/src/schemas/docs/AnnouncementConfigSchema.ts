import { z } from "zod";
import { FeatureFlagSchema } from "./FeatureFlagSchema.js";

export const AnnouncementConfigSchema = z.object({
    text: z.string().optional(),
    message: z.string().optional(),
    style: z.enum(["info", "warning", "success", "error"]).optional(),
    dismissible: z.boolean().optional(),
    featureFlag: FeatureFlagSchema.optional()
});

export type AnnouncementConfigSchema = z.infer<typeof AnnouncementConfigSchema>;
