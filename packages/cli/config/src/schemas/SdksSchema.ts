import { z } from "zod";
import { ReadmeSchema } from "./ReadmeSchema";
import { SdkTargetSchema } from "./SdkTargetSchema";

export const SdksSchema = z.object({
    autorelease: z.boolean().optional(),
    defaultGroup: z.string().optional(),
    readme: ReadmeSchema.optional(),
    targets: z.record(z.string(), SdkTargetSchema)
});

export type SdksSchema = z.infer<typeof SdksSchema>;
