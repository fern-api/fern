import { z } from "zod";

export const MavenRegistryOutputSchema: z.ZodObject<
    {
        url: z.ZodOptional<z.ZodString>;
        coordinate: z.ZodString;
        username: z.ZodOptional<z.ZodString>;
        password: z.ZodOptional<z.ZodString>;
    },
    "strict",
    z.ZodTypeAny,
    { coordinate: string; url?: string | undefined; username?: string | undefined; password?: string | undefined },
    { coordinate: string; url?: string | undefined; username?: string | undefined; password?: string | undefined }
> = z.strictObject({
    url: z.optional(z.string()),
    coordinate: z.string(),
    username: z.optional(z.string()),
    password: z.optional(z.string())
});

export type MavenRegistryOutputSchema = z.infer<typeof MavenRegistryOutputSchema>;
