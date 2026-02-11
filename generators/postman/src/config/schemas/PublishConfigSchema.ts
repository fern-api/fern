import { z } from "zod";

export const PublishConfigSchema: z.ZodObject<
    { apiKey: z.ZodString; workspaceId: z.ZodOptional<z.ZodString>; collectionId: z.ZodOptional<z.ZodString> },
    "strict",
    z.ZodTypeAny,
    { apiKey: string; workspaceId?: string | undefined; collectionId?: string | undefined },
    { apiKey: string; workspaceId?: string | undefined; collectionId?: string | undefined }
> = z.strictObject({
    apiKey: z.string(),
    workspaceId: z.string().optional(),
    collectionId: z.string().optional()
});

export type PublishConfigSchema = z.infer<typeof PublishConfigSchema>;
