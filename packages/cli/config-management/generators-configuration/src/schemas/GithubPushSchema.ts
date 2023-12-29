import { z } from "zod";
import { GithubLicenseSchema } from "./GithubLicenseSchema";

export const GithubPushSchema = z.strictObject({
    repository: z.string(),
    license: z.optional(GithubLicenseSchema),
    mode: z.literal("push"),
    branch: z.optional(z.string())
});

export type GithubPushSchema = z.infer<typeof GithubPushSchema>;
