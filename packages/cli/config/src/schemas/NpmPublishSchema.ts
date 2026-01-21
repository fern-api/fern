import { z } from "zod";

export const NpmPublishSchema = z.object({
    packageName: z.string()
});

export type NpmPublishSchema = z.infer<typeof NpmPublishSchema>;
