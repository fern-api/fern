import { z } from "zod";

export const PublishConfigSchema = z.strictObject({
    apiKey: z.string(),
    workspaceId: z.string().optional(),
    collectionId: z.string().optional()
});

export type PublishConfigSchema = z.infer<typeof PublishConfigSchema>;
