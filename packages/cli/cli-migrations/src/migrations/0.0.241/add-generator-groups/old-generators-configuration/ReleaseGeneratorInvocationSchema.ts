import { z } from "zod";

import { BaseGeneratorInvocationSchema } from "./BaseGeneratorInvocationSchema";
import { GeneratorPublishingSchema } from "./GeneratorPublishingSchema";
import { GithubRepositoryOutputSchema } from "./GithubRepositoryOutputSchema";

export const ReleaseGeneratorInvocationSchema: z.ZodObject<
    {
        name: z.ZodString;
        version: z.ZodString;
        config: z.ZodUnknown;
        audiences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    } & {
        publishing: z.ZodOptional<
            z.ZodUnion<
                [
                    z.ZodObject<
                        {
                            npm: z.ZodObject<
                                {
                                    url: z.ZodOptional<z.ZodString>;
                                    "package-name": z.ZodString;
                                    token: z.ZodOptional<z.ZodString>;
                                },
                                "strict",
                                z.ZodTypeAny,
                                { "package-name": string; url?: string | undefined; token?: string | undefined },
                                { "package-name": string; url?: string | undefined; token?: string | undefined }
                            >;
                        },
                        "strict",
                        z.ZodTypeAny,
                        { npm: { "package-name": string; url?: string | undefined; token?: string | undefined } },
                        { npm: { "package-name": string; url?: string | undefined; token?: string | undefined } }
                    >,
                    z.ZodObject<
                        {
                            maven: z.ZodObject<
                                {
                                    url: z.ZodOptional<z.ZodString>;
                                    coordinate: z.ZodString;
                                    username: z.ZodOptional<z.ZodString>;
                                    password: z.ZodOptional<z.ZodString>;
                                },
                                "strict",
                                z.ZodTypeAny,
                                {
                                    coordinate: string;
                                    url?: string | undefined;
                                    username?: string | undefined;
                                    password?: string | undefined;
                                },
                                {
                                    coordinate: string;
                                    url?: string | undefined;
                                    username?: string | undefined;
                                    password?: string | undefined;
                                }
                            >;
                        },
                        "strict",
                        z.ZodTypeAny,
                        {
                            maven: {
                                coordinate: string;
                                url?: string | undefined;
                                username?: string | undefined;
                                password?: string | undefined;
                            };
                        },
                        {
                            maven: {
                                coordinate: string;
                                url?: string | undefined;
                                username?: string | undefined;
                                password?: string | undefined;
                            };
                        }
                    >,
                    z.ZodObject<
                        {
                            postman: z.ZodObject<
                                { "api-key": z.ZodString; "workspace-id": z.ZodString },
                                "strict",
                                z.ZodTypeAny,
                                { "api-key": string; "workspace-id": string },
                                { "api-key": string; "workspace-id": string }
                            >;
                        },
                        "strict",
                        z.ZodTypeAny,
                        { postman: { "api-key": string; "workspace-id": string } },
                        { postman: { "api-key": string; "workspace-id": string } }
                    >
                ]
            >
        >;
        github: z.ZodOptional<
            z.ZodObject<
                { repository: z.ZodString },
                "strict",
                z.ZodTypeAny,
                { repository: string },
                { repository: string }
            >
        >;
    },
    "strict",
    z.ZodTypeAny,
    {
        version: string;
        name: string;
        audiences?: Array<string> | undefined;
        github?: { repository: string } | undefined;
        config?: unknown;
        publishing?:
            | { npm: { "package-name": string; url?: string | undefined; token?: string | undefined } }
            | {
                  maven: {
                      coordinate: string;
                      url?: string | undefined;
                      username?: string | undefined;
                      password?: string | undefined;
                  };
              }
            | { postman: { "api-key": string; "workspace-id": string } }
            | undefined;
    },
    {
        version: string;
        name: string;
        audiences?: Array<string> | undefined;
        github?: { repository: string } | undefined;
        config?: unknown;
        publishing?:
            | { npm: { "package-name": string; url?: string | undefined; token?: string | undefined } }
            | {
                  maven: {
                      coordinate: string;
                      url?: string | undefined;
                      username?: string | undefined;
                      password?: string | undefined;
                  };
              }
            | { postman: { "api-key": string; "workspace-id": string } }
            | undefined;
    }
> = BaseGeneratorInvocationSchema.extend({
    publishing: z.optional(GeneratorPublishingSchema),
    github: z.optional(GithubRepositoryOutputSchema)
});

export type ReleaseGeneratorInvocationSchema = z.infer<typeof ReleaseGeneratorInvocationSchema>;
