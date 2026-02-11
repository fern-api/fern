import { z } from "zod";

import { GeneratorGroupSchema } from "./GeneratorGroupSchema";

export const DEFAULT_GROUP_GENERATORS_CONFIG_KEY = "default-group";

export const GeneratorsConfigurationSchema: z.ZodObject<
    {
        "default-group": z.ZodOptional<z.ZodString>;
        groups: z.ZodOptional<
            z.ZodRecord<
                z.ZodString,
                z.ZodObject<
                    {
                        audiences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                        docs: z.ZodOptional<
                            z.ZodObject<
                                {
                                    domain: z.ZodString;
                                    "custom-domains": z.ZodOptional<
                                        z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>
                                    >;
                                },
                                "strict",
                                z.ZodTypeAny,
                                { domain: string; "custom-domains"?: string | Array<string> | undefined },
                                { domain: string; "custom-domains"?: string | Array<string> | undefined }
                            >
                        >;
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
                        }>;
                        audiences?: Array<string> | undefined;
                        docs?: { domain: string; "custom-domains"?: string | Array<string> | undefined } | undefined;
                    },
                    {
                        generators: Array<{
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
                        }>;
                        audiences?: Array<string> | undefined;
                        docs?: { domain: string; "custom-domains"?: string | Array<string> | undefined } | undefined;
                    }
                >
            >
        >;
    },
    "strict",
    z.ZodTypeAny,
    {
        groups?:
            | Record<
                  string,
                  {
                      generators: Array<{
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
                      }>;
                      audiences?: Array<string> | undefined;
                      docs?: { domain: string; "custom-domains"?: string | Array<string> | undefined } | undefined;
                  }
              >
            | undefined;
        "default-group"?: string | undefined;
    },
    {
        groups?:
            | Record<
                  string,
                  {
                      generators: Array<{
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
                      }>;
                      audiences?: Array<string> | undefined;
                      docs?: { domain: string; "custom-domains"?: string | Array<string> | undefined } | undefined;
                  }
              >
            | undefined;
        "default-group"?: string | undefined;
    }
> = z.strictObject({
    [DEFAULT_GROUP_GENERATORS_CONFIG_KEY]: z.optional(z.string()),
    groups: z.optional(z.record(GeneratorGroupSchema))
});

export type GeneratorsConfigurationSchema = z.infer<typeof GeneratorsConfigurationSchema>;
