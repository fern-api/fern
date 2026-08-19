import { z } from "zod";

export const MavenSignatureSchema = z.object({
    keyId: z.string(),
    password: z.string(),
    secretKey: z.string()
});

export type MavenSignatureSchema = z.infer<typeof MavenSignatureSchema>;

export const MavenPublishSchema = z.object({
    coordinate: z.string(),
    url: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    signature: MavenSignatureSchema.optional()
});

export type MavenPublishSchema = z.infer<typeof MavenPublishSchema>;
