import { z } from "zod";

import { GeneratorInvocationSchema } from "./GeneratorInvocationSchema";

export const GeneratorGroupSchema: z.ZodObject<
    {
        audiences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        generators: z.ZodArray<
            z.ZodObject<
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
                                        location: z.ZodLiteral<"postman">;
                                        "api-key": z.ZodString;
                                        "workspace-id": z.ZodString;
                                    },
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
                            { repository: z.ZodString },
                            "strict",
                            z.ZodTypeAny,
                            { repository: string },
                            { repository: string }
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
                        | {
                              location: "npm";
                              "package-name": string;
                              url?: string | undefined;
                              token?: string | undefined;
                          }
                        | {
                              location: "maven";
                              coordinate: string;
                              url?: string | undefined;
                              username?: string | undefined;
                              password?: string | undefined;
                          }
                        | { location: "postman"; "api-key": string; "workspace-id": string }
                        | { path: string; location: "local-file-system" }
                        | undefined;
                    github?: { repository: string } | undefined;
                    config?: unknown;
                },
                {
                    version: string;
                    name: string;
                    output?:
                        | {
                              location: "npm";
                              "package-name": string;
                              url?: string | undefined;
                              token?: string | undefined;
                          }
                        | {
                              location: "maven";
                              coordinate: string;
                              url?: string | undefined;
                              username?: string | undefined;
                              password?: string | undefined;
                          }
                        | { location: "postman"; "api-key": string; "workspace-id": string }
                        | { path: string; location: "local-file-system" }
                        | undefined;
                    github?: { repository: string } | undefined;
                    config?: unknown;
                }
            >,
            "many"
        >;
    },
    "strict",
    z.ZodTypeAny,
    {
        generators: Array<{
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
                | { location: "postman"; "api-key": string; "workspace-id": string }
                | { path: string; location: "local-file-system" }
                | undefined;
            github?: { repository: string } | undefined;
            config?: unknown;
        }>;
        audiences?: Array<string> | undefined;
    },
    {
        generators: Array<{
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
                | { location: "postman"; "api-key": string; "workspace-id": string }
                | { path: string; location: "local-file-system" }
                | undefined;
            github?: { repository: string } | undefined;
            config?: unknown;
        }>;
        audiences?: Array<string> | undefined;
    }
> = z.strictObject({
    audiences: z.optional(z.array(z.string())),
    generators: z.array(GeneratorInvocationSchema)
});

export type GeneratorGroupSchema = z.infer<typeof GeneratorGroupSchema>;
