import { z } from "zod";

import { GithubLicenseCustomSchema } from "./GithubLicenseCustomSchema";

export const GithubLicenseSchema: z.ZodUnion<
    [
        z.ZodEnum<["MIT", "Apache-2.0"]>,
        z.ZodObject<{ custom: z.ZodString }, "strict", z.ZodTypeAny, { custom: string }, { custom: string }>
    ]
> = z.union([z.enum(["MIT", "Apache-2.0"]), GithubLicenseCustomSchema]);

export type GithubLicenseSchema = z.infer<typeof GithubLicenseSchema>;
