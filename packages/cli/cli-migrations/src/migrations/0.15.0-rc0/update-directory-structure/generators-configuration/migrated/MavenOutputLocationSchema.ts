import { z } from "zod";

export const MavenOutputLocationSchema: z.ZodObject<
    {
        location: z.ZodLiteral<"maven">;
        url: z.ZodOptional<z.ZodString>;
        coordinate: z.ZodString;
        username: z.ZodOptional<z.ZodString>;
        password: z.ZodOptional<z.ZodString>;
    },
    "strict",
    z.ZodTypeAny,
    {
        location: "maven";
        coordinate: string;
        url?: string | undefined;
        username?: string | undefined;
        password?: string | undefined;
    },
    {
        location: "maven";
        coordinate: string;
        url?: string | undefined;
        username?: string | undefined;
        password?: string | undefined;
    }
> = z.strictObject({
    location: z.literal("maven"),
    url: z.optional(z.string()),
    coordinate: z.string(),
    username: z.optional(z.string()),
    password: z.optional(z.string())
});

export type MavenOutputLocationSchema = z.infer<typeof MavenOutputLocationSchema>;
