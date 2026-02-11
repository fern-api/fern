import { z } from "zod";

export const MavenSignatureSchema: z.ZodObject<
    { keyId: z.ZodString; password: z.ZodString; secretKey: z.ZodString },
    z.core.$strip
> = z.object({
    keyId: z.string(),
    password: z.string(),
    secretKey: z.string()
});

export type MavenSignatureSchema = z.infer<typeof MavenSignatureSchema>;

export const MavenPublishSchema: z.ZodObject<
    {
        coordinate: z.ZodString;
        url: z.ZodOptional<z.ZodString>;
        username: z.ZodOptional<z.ZodString>;
        password: z.ZodOptional<z.ZodString>;
        signature: z.ZodOptional<
            z.ZodObject<{ keyId: z.ZodString; password: z.ZodString; secretKey: z.ZodString }, z.core.$strip>
        >;
    },
    z.core.$strip
> = z.object({
    coordinate: z.string(),
    url: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    signature: MavenSignatureSchema.optional()
});

export type MavenPublishSchema = z.infer<typeof MavenPublishSchema>;
