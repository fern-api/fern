import { z } from "zod";

import { DraftGeneratorInvocationSchema } from "./DraftGeneratorInvocationSchema";
import { ReleaseGeneratorInvocationSchema } from "./ReleaseGeneratorInvocationSchema";

export const GeneratorsConfigurationSchema: z.ZodObject<
    {
        draft: z.ZodOptional<
            z.ZodArray<
                z.ZodObject<
                    {
                        name: z.ZodString;
                        version: z.ZodString;
                        config: z.ZodUnknown;
                        audiences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    } & {
                        mode: z.ZodUnion<[z.ZodLiteral<"publish">, z.ZodLiteral<"download-files">]>;
                        "output-path": z.ZodOptional<z.ZodString>;
                    },
                    "strict",
                    z.ZodTypeAny,
                    {
                        version: string;
                        name: string;
                        mode: "publish" | "download-files";
                        audiences?: Array<string> | undefined;
                        "output-path"?: string | undefined;
                        config?: unknown;
                    },
                    {
                        version: string;
                        name: string;
                        mode: "publish" | "download-files";
                        audiences?: Array<string> | undefined;
                        "output-path"?: string | undefined;
                        config?: unknown;
                    }
                >,
                "many"
            >
        >;
        release: z.ZodOptional<
            z.ZodArray<
                z.ZodObject<
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
                                                {
                                                    "package-name": string;
                                                    url?: string | undefined;
                                                    token?: string | undefined;
                                                },
                                                {
                                                    "package-name": string;
                                                    url?: string | undefined;
                                                    token?: string | undefined;
                                                }
                                            >;
                                        },
                                        "strict",
                                        z.ZodTypeAny,
                                        {
                                            npm: {
                                                "package-name": string;
                                                url?: string | undefined;
                                                token?: string | undefined;
                                            };
                                        },
                                        {
                                            npm: {
                                                "package-name": string;
                                                url?: string | undefined;
                                                token?: string | undefined;
                                            };
                                        }
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
                >,
                "many"
            >
        >;
    },
    "strict",
    z.ZodTypeAny,
    {
        draft?:
            | Array<{
                  version: string;
                  name: string;
                  mode: "publish" | "download-files";
                  audiences?: Array<string> | undefined;
                  "output-path"?: string | undefined;
                  config?: unknown;
              }>
            | undefined;
        release?:
            | Array<{
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
              }>
            | undefined;
    },
    {
        draft?:
            | Array<{
                  version: string;
                  name: string;
                  mode: "publish" | "download-files";
                  audiences?: Array<string> | undefined;
                  "output-path"?: string | undefined;
                  config?: unknown;
              }>
            | undefined;
        release?:
            | Array<{
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
              }>
            | undefined;
    }
> = z.strictObject({
    draft: z.optional(z.array(DraftGeneratorInvocationSchema)),
    release: z.optional(z.array(ReleaseGeneratorInvocationSchema))
});

export type GeneratorsConfigurationSchema = z.infer<typeof GeneratorsConfigurationSchema>;
