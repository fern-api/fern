import { z } from "zod";

export const MavenOutputSignatureSchema = z.strictObject({
    keyId: z.string(),
    password: z.string(),
    secretKey: z.string()
});

export const MavenOutputLocationSchema = z.strictObject({
    location: z.literal("maven"),
    url: z.optional(z.string()),
    coordinate: z.string(),
    username: z.optional(z.string()),
    password: z.optional(z.string()),
    signature: z.optional(MavenOutputSignatureSchema)
});

export type MavenOutputLocationSchema = z.infer<typeof MavenOutputLocationSchema>;
