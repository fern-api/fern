import { z } from "zod";

import { GithubLicenseSchema } from "./GithubLicenseSchema";

export const GithubConfigurationSchema: z.ZodObject<
    {
        repository: z.ZodString;
        license: z.ZodOptional<
            z.ZodUnion<
                [
                    z.ZodEnum<["MIT", "Apache-2.0"]>,
                    z.ZodObject<{ custom: z.ZodString }, "strict", z.ZodTypeAny, { custom: string }, { custom: string }>
                ]
            >
        >;
        mode: z.ZodOptional<z.ZodEnum<["pull-request", "commit"]>>;
    },
    "strict",
    z.ZodTypeAny,
    {
        repository: string;
        mode?: "pull-request" | "commit" | undefined;
        license?: "MIT" | "Apache-2.0" | { custom: string } | undefined;
    },
    {
        repository: string;
        mode?: "pull-request" | "commit" | undefined;
        license?: "MIT" | "Apache-2.0" | { custom: string } | undefined;
    }
> = z.strictObject({
    repository: z.string(),
    license: z.optional(GithubLicenseSchema),
    mode: z.optional(z.enum(["pull-request", "commit"]))
});

export type GithubConfigurationSchema = z.infer<typeof GithubConfigurationSchema>;
