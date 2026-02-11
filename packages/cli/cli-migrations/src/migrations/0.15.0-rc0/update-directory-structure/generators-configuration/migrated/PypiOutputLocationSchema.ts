import { z } from "zod";

export const PypiOutputLocationSchema: z.ZodObject<
    {
        location: z.ZodLiteral<"pypi">;
        url: z.ZodOptional<z.ZodString>;
        "package-name": z.ZodString;
        token: z.ZodOptional<z.ZodString>;
        username: z.ZodOptional<z.ZodString>;
        password: z.ZodOptional<z.ZodString>;
    },
    "strict",
    z.ZodTypeAny,
    {
        location: "pypi";
        "package-name": string;
        url?: string | undefined;
        token?: string | undefined;
        username?: string | undefined;
        password?: string | undefined;
    },
    {
        location: "pypi";
        "package-name": string;
        url?: string | undefined;
        token?: string | undefined;
        username?: string | undefined;
        password?: string | undefined;
    }
> = z.strictObject({
    location: z.literal("pypi"),
    url: z.optional(z.string()),
    "package-name": z.string(),
    token: z.optional(z.string()),
    username: z.optional(z.string()),
    password: z.optional(z.string())
});

export type PostmanOutputLocationSchema = z.infer<typeof PypiOutputLocationSchema>;
