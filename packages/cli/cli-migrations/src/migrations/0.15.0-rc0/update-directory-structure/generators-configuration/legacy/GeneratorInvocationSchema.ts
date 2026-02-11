import { z } from "zod";

import { GeneratorOutputSchema } from "./GeneratorOutputSchema";
import { GithubConfigurationSchema } from "./GithubConfigurationSchema";

export const GeneratorInvocationSchema: z.ZodObject<
    {
        name: z.ZodString;
        version: z.ZodString;
        output: z.ZodOptional<
            z.ZodDiscriminatedUnion<
                "location",
                [
                    z.ZodObject<
                        {
                            location: z.ZodLiteral<"npm">;
                            url: z.ZodOptional<z.ZodString>;
                            "package-name": z.ZodString;
                            token: z.ZodOptional<z.ZodString>;
                        },
                        "strict",
                        z.ZodTypeAny,
                        {
                            location: "npm";
                            "package-name": string;
                            url?: string | undefined;
                            token?: string | undefined;
                        },
                        {
                            location: "npm";
                            "package-name": string;
                            url?: string | undefined;
                            token?: string | undefined;
                        }
                    >,
                    z.ZodObject<
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
                    >,
                    z.ZodObject<
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
                    >,
                    z.ZodObject<
                        { location: z.ZodLiteral<"postman">; "api-key": z.ZodString; "workspace-id": z.ZodString },
                        "strict",
                        z.ZodTypeAny,
                        { location: "postman"; "api-key": string; "workspace-id": string },
                        { location: "postman"; "api-key": string; "workspace-id": string }
                    >,
                    z.ZodObject<
                        { location: z.ZodLiteral<"local-file-system">; path: z.ZodString },
                        "strict",
                        z.ZodTypeAny,
                        { path: string; location: "local-file-system" },
                        { path: string; location: "local-file-system" }
                    >
                ]
            >
        >;
        github: z.ZodOptional<
            z.ZodObject<
                {
                    repository: z.ZodString;
                    license: z.ZodOptional<
                        z.ZodUnion<
                            [
                                z.ZodEnum<["MIT", "Apache-2.0"]>,
                                z.ZodObject<
                                    { custom: z.ZodString },
                                    "strict",
                                    z.ZodTypeAny,
                                    { custom: string },
                                    { custom: string }
                                >
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
            >
        >;
        config: z.ZodUnknown;
    },
    "strict",
    z.ZodTypeAny,
    {
        version: string;
        name: string;
        output?:
            | { location: "npm"; "package-name": string; url?: string | undefined; token?: string | undefined }
            | {
                  location: "maven";
                  coordinate: string;
                  url?: string | undefined;
                  username?: string | undefined;
                  password?: string | undefined;
              }
            | {
                  location: "pypi";
                  "package-name": string;
                  url?: string | undefined;
                  token?: string | undefined;
                  username?: string | undefined;
                  password?: string | undefined;
              }
            | { location: "postman"; "api-key": string; "workspace-id": string }
            | { path: string; location: "local-file-system" }
            | undefined;
        github?:
            | {
                  repository: string;
                  mode?: "pull-request" | "commit" | undefined;
                  license?: "MIT" | "Apache-2.0" | { custom: string } | undefined;
              }
            | undefined;
        config?: unknown;
    },
    {
        version: string;
        name: string;
        output?:
            | { location: "npm"; "package-name": string; url?: string | undefined; token?: string | undefined }
            | {
                  location: "maven";
                  coordinate: string;
                  url?: string | undefined;
                  username?: string | undefined;
                  password?: string | undefined;
              }
            | {
                  location: "pypi";
                  "package-name": string;
                  url?: string | undefined;
                  token?: string | undefined;
                  username?: string | undefined;
                  password?: string | undefined;
              }
            | { location: "postman"; "api-key": string; "workspace-id": string }
            | { path: string; location: "local-file-system" }
            | undefined;
        github?:
            | {
                  repository: string;
                  mode?: "pull-request" | "commit" | undefined;
                  license?: "MIT" | "Apache-2.0" | { custom: string } | undefined;
              }
            | undefined;
        config?: unknown;
    }
> = z.strictObject({
    name: z.string(),
    version: z.string(),
    output: z.optional(GeneratorOutputSchema),
    github: z.optional(GithubConfigurationSchema),
    config: z.unknown()
});

export type GeneratorInvocationSchema = z.infer<typeof GeneratorInvocationSchema>;
