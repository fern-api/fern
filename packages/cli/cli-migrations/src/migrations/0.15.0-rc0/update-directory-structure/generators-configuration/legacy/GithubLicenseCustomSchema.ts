import { z } from "zod";

export const GithubLicenseCustomSchema = z.strictObject({
    custom: z.string()
});

export type GithubLicenseCustomSchema = z.infer<typeof GithubLicenseCustomSchema>;
