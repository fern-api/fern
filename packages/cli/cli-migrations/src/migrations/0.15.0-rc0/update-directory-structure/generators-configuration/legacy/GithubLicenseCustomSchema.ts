import { z } from "zod";

export const GithubLicenseCustomSchema: z.ZodObject<
    { custom: z.ZodString },
    "strict",
    z.ZodTypeAny,
    { custom: string },
    { custom: string }
> = z.strictObject({
    custom: z.string()
});

export type GithubLicenseCustomSchema = z.infer<typeof GithubLicenseCustomSchema>;
