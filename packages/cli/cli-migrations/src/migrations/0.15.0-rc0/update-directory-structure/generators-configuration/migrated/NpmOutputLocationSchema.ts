import { z } from "zod";

export const NpmOutputLocationSchema: z.ZodObject<
    {
        location: z.ZodLiteral<"npm">;
        url: z.ZodOptional<z.ZodString>;
        "package-name": z.ZodString;
        token: z.ZodOptional<z.ZodString>;
    },
    "strict",
    z.ZodTypeAny,
    { location: "npm"; "package-name": string; url?: string | undefined; token?: string | undefined },
    { location: "npm"; "package-name": string; url?: string | undefined; token?: string | undefined }
> = z.strictObject({
    location: z.literal("npm"),
    url: z.optional(z.string()),
    "package-name": z.string(),
    token: z.optional(z.string())
});

export type NpmOutputLocationSchema = z.infer<typeof NpmOutputLocationSchema>;
