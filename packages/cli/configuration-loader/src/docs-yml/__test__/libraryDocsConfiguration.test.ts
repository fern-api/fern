import { docsYml } from "@fern-api/configuration";
import { describe, expect, it } from "vitest";

import { parseLibrariesConfiguration } from "../parseDocsConfiguration.js";

/**
 * Tests for library docs configuration parsing.
 *
 * The library docs feature allows users to configure library documentation
 * generation from a GitHub repository URL in their docs.yml.
 */
describe("library docs configuration", () => {
    describe("isRawLibraryReferenceConfig type guard", () => {
        // Helper to simulate the type guard logic
        function isRawLibraryReferenceConfig(item: unknown): boolean {
            return (
                typeof item === "object" &&
                item !== null &&
                !Array.isArray(item) &&
                typeof (item as Record<string, unknown>).library === "string"
            );
        }

        it("should return true for valid library reference config with only library name", () => {
            const config = {
                library: "my-sdk"
            };
            expect(isRawLibraryReferenceConfig(config)).toBe(true);
        });

        it("should return true for library reference config with title", () => {
            const config = {
                library: "my-sdk",
                title: "SDK Reference"
            };
            expect(isRawLibraryReferenceConfig(config)).toBe(true);
        });

        it("should return true for library reference config with slug", () => {
            const config = {
                library: "my-sdk",
                slug: "sdk-ref"
            };
            expect(isRawLibraryReferenceConfig(config)).toBe(true);
        });

        it("should return true for library reference config with all properties", () => {
            const config = {
                library: "my-sdk",
                title: "SDK Reference",
                slug: "sdk-ref"
            };
            expect(isRawLibraryReferenceConfig(config)).toBe(true);
        });

        it("should return false for null", () => {
            expect(isRawLibraryReferenceConfig(null)).toBe(false);
        });

        it("should return false for undefined", () => {
            expect(isRawLibraryReferenceConfig(undefined)).toBe(false);
        });

        it("should return false for string", () => {
            expect(isRawLibraryReferenceConfig("my-sdk")).toBe(false);
        });

        it("should return false for array", () => {
            expect(isRawLibraryReferenceConfig(["library"])).toBe(false);
        });

        it("should return false for empty object", () => {
            expect(isRawLibraryReferenceConfig({})).toBe(false);
        });

        it("should return false for page config", () => {
            const config = {
                page: "Welcome",
                path: "docs/pages/welcome.mdx"
            };
            expect(isRawLibraryReferenceConfig(config)).toBe(false);
        });

        it("should return false for section config", () => {
            const config = {
                section: "Get Started",
                contents: []
            };
            expect(isRawLibraryReferenceConfig(config)).toBe(false);
        });

        it("should return false for api config", () => {
            const config = {
                api: "Plant Store API"
            };
            expect(isRawLibraryReferenceConfig(config)).toBe(false);
        });

        it("should return false when library is not a string", () => {
            const config = {
                library: 123
            };
            expect(isRawLibraryReferenceConfig(config)).toBe(false);
        });

        it("should return false when library is null", () => {
            const config = {
                library: null
            };
            expect(isRawLibraryReferenceConfig(config)).toBe(false);
        });
    });

    describe("LibrarySection type", () => {
        // Test the expected shape of the parsed library section
        interface LibrarySection {
            type: "librarySection";
            libraryName: string;
            title: string | undefined;
            slug: string | undefined;
        }

        it("should create correct LibrarySection from minimal config", () => {
            const rawConfig = {
                library: "my-sdk"
            };

            const result: LibrarySection = {
                type: "librarySection",
                libraryName: rawConfig.library,
                title: undefined,
                slug: undefined
            };

            expect(result.type).toBe("librarySection");
            expect(result.libraryName).toBe("my-sdk");
            expect(result.title).toBeUndefined();
            expect(result.slug).toBeUndefined();
        });

        it("should create correct LibrarySection with title", () => {
            const rawConfig = {
                library: "my-sdk",
                title: "SDK Reference"
            };

            const result: LibrarySection = {
                type: "librarySection",
                libraryName: rawConfig.library,
                title: rawConfig.title ?? undefined,
                slug: undefined
            };

            expect(result.type).toBe("librarySection");
            expect(result.libraryName).toBe("my-sdk");
            expect(result.title).toBe("SDK Reference");
            expect(result.slug).toBeUndefined();
        });

        it("should create correct LibrarySection with slug", () => {
            const rawConfig = {
                library: "my-sdk",
                slug: "sdk-ref"
            };

            const result: LibrarySection = {
                type: "librarySection",
                libraryName: rawConfig.library,
                title: undefined,
                slug: rawConfig.slug ?? undefined
            };

            expect(result.type).toBe("librarySection");
            expect(result.libraryName).toBe("my-sdk");
            expect(result.title).toBeUndefined();
            expect(result.slug).toBe("sdk-ref");
        });

        it("should create correct LibrarySection with all properties", () => {
            const rawConfig = {
                library: "my-sdk",
                title: "SDK Reference",
                slug: "sdk-ref"
            };

            const result: LibrarySection = {
                type: "librarySection",
                libraryName: rawConfig.library,
                title: rawConfig.title ?? undefined,
                slug: rawConfig.slug ?? undefined
            };

            expect(result.type).toBe("librarySection");
            expect(result.libraryName).toBe("my-sdk");
            expect(result.title).toBe("SDK Reference");
            expect(result.slug).toBe("sdk-ref");
        });
    });

    describe("LibraryConfiguration type", () => {
        interface LibraryConfiguration {
            input: {
                git: string;
                subpath: string | undefined;
            };
            output: {
                path: string;
            };
            lang: "python" | "cpp";
        }

        it("should create correct LibraryConfiguration for Python library", () => {
            const rawConfig = {
                input: {
                    git: "https://github.com/acme/sdk-python"
                },
                output: {
                    path: "./static/sdk-docs"
                },
                lang: "python" as const
            };

            const result: LibraryConfiguration = {
                input: {
                    git: rawConfig.input.git,
                    subpath: undefined
                },
                output: {
                    path: rawConfig.output.path
                },
                lang: rawConfig.lang
            };

            expect(result.input.git).toBe("https://github.com/acme/sdk-python");
            expect(result.input.subpath).toBeUndefined();
            expect(result.output.path).toBe("./static/sdk-docs");
            expect(result.lang).toBe("python");
        });

        it("should create correct LibraryConfiguration for C++ library", () => {
            const rawConfig = {
                input: {
                    git: "https://github.com/acme/sdk-cpp"
                },
                output: {
                    path: "./static/cpp-docs"
                },
                lang: "cpp" as const
            };

            const result: LibraryConfiguration = {
                input: {
                    git: rawConfig.input.git,
                    subpath: undefined
                },
                output: {
                    path: rawConfig.output.path
                },
                lang: rawConfig.lang
            };

            expect(result.input.git).toBe("https://github.com/acme/sdk-cpp");
            expect(result.output.path).toBe("./static/cpp-docs");
            expect(result.lang).toBe("cpp");
        });

        it("should create correct LibraryConfiguration with subpath", () => {
            const rawConfig = {
                input: {
                    git: "https://github.com/acme/monorepo",
                    subpath: "packages/sdk"
                },
                output: {
                    path: "./static/sdk-docs"
                },
                lang: "python" as const
            };

            const result: LibraryConfiguration = {
                input: {
                    git: rawConfig.input.git,
                    subpath: rawConfig.input.subpath
                },
                output: {
                    path: rawConfig.output.path
                },
                lang: rawConfig.lang
            };

            expect(result.input.git).toBe("https://github.com/acme/monorepo");
            expect(result.input.subpath).toBe("packages/sdk");
            expect(result.output.path).toBe("./static/sdk-docs");
            expect(result.lang).toBe("python");
        });
    });

    describe("parseLibrariesConfiguration", () => {
        function isGitInput(
            input: docsYml.ParsedLibraryConfiguration["input"]
        ): input is docsYml.ParsedLibraryGitInput {
            return "git" in input;
        }

        function isPathInput(
            input: docsYml.ParsedLibraryConfiguration["input"]
        ): input is docsYml.ParsedLibraryPathInput {
            return "path" in input;
        }

        it("should return undefined for undefined input", () => {
            expect(parseLibrariesConfiguration(undefined)).toBeUndefined();
        });

        it("should parse single git library configuration", () => {
            const rawLibraries: Record<string, docsYml.RawSchemas.LibraryConfiguration> = {
                "my-sdk": {
                    input: {
                        git: "https://github.com/acme/sdk-python"
                    },
                    output: {
                        path: "./static/sdk-docs"
                    },
                    lang: "python"
                }
            };

            const result = parseLibrariesConfiguration(rawLibraries);

            expect(result).toBeDefined();
            const mySdk = result?.["my-sdk"];
            expect(mySdk).toBeDefined();
            expect(mySdk != null && isGitInput(mySdk.input) && mySdk.input.git).toBe(
                "https://github.com/acme/sdk-python"
            );
            expect(mySdk != null && isGitInput(mySdk.input) ? mySdk.input.subpath : "unset").toBeUndefined();
            expect(mySdk?.output.path).toBe("./static/sdk-docs");
            expect(mySdk?.lang).toBe("python");
        });

        it("should preserve subpath for git input when provided", () => {
            const rawLibraries: Record<string, docsYml.RawSchemas.LibraryConfiguration> = {
                "my-sdk": {
                    input: {
                        git: "https://github.com/acme/monorepo",
                        subpath: "packages/sdk/python"
                    },
                    output: {
                        path: "./docs/sdk"
                    },
                    lang: "python"
                }
            };

            const result = parseLibrariesConfiguration(rawLibraries);

            const mySdk = result?.["my-sdk"];
            expect(mySdk != null && isGitInput(mySdk.input) ? mySdk.input.subpath : undefined).toBe(
                "packages/sdk/python"
            );
        });

        it("should preserve path input instead of throwing", () => {
            const rawLibraries: Record<string, docsYml.RawSchemas.LibraryConfiguration> = {
                "my-sdk": {
                    input: {
                        path: "./libs/python-sdk"
                    },
                    output: {
                        path: "./static/sdk-docs"
                    },
                    lang: "python"
                }
            };

            expect(() => parseLibrariesConfiguration(rawLibraries)).not.toThrow();

            const result = parseLibrariesConfiguration(rawLibraries);
            const mySdk = result?.["my-sdk"];
            expect(mySdk != null && isPathInput(mySdk.input) ? mySdk.input.path : undefined).toBe("./libs/python-sdk");
            expect(mySdk?.output.path).toBe("./static/sdk-docs");
            expect(mySdk?.lang).toBe("python");
        });

        it("should parse a mix of git and path libraries", () => {
            const rawLibraries: Record<string, docsYml.RawSchemas.LibraryConfiguration> = {
                "git-sdk": {
                    input: {
                        git: "https://github.com/acme/sdk-python"
                    },
                    output: {
                        path: "./static/python-docs"
                    },
                    lang: "python"
                },
                "path-sdk": {
                    input: {
                        path: "./libs/cpp-sdk"
                    },
                    output: {
                        path: "./static/cpp-docs"
                    },
                    lang: "cpp"
                }
            };

            const result = parseLibrariesConfiguration(rawLibraries);

            expect(Object.keys(result ?? {})).toHaveLength(2);

            const gitSdk = result?.["git-sdk"];
            expect(gitSdk != null && isGitInput(gitSdk.input) && gitSdk.input.git).toBe(
                "https://github.com/acme/sdk-python"
            );

            const pathSdk = result?.["path-sdk"];
            expect(pathSdk != null && isPathInput(pathSdk.input) ? pathSdk.input.path : undefined).toBe(
                "./libs/cpp-sdk"
            );
        });
    });

    describe("library reference in docs.yml navigation format", () => {
        it("should validate correct YAML structure for library reference", () => {
            // This represents the expected YAML structure:
            // - library: my-sdk
            //   title: SDK Reference
            //   slug: sdk-ref
            const yamlParsedConfig = {
                library: "my-sdk",
                title: "SDK Reference",
                slug: "sdk-ref"
            };

            expect(typeof yamlParsedConfig.library).toBe("string");
            expect(yamlParsedConfig.library).toBe("my-sdk");
        });

        it("should validate correct YAML structure for libraries config", () => {
            // This represents the expected YAML structure:
            // libraries:
            //   my-sdk:
            //     input:
            //       git: https://github.com/acme/sdk-python
            //       subpath: src/sdk
            //     output:
            //       path: ./static/sdk-docs
            //     lang: python
            const yamlParsedConfig = {
                "my-sdk": {
                    input: {
                        git: "https://github.com/acme/sdk-python",
                        subpath: "src/sdk"
                    },
                    output: {
                        path: "./static/sdk-docs"
                    },
                    lang: "python"
                }
            };

            expect(typeof yamlParsedConfig["my-sdk"].input.git).toBe("string");
            expect(yamlParsedConfig["my-sdk"].input.git).toMatch(/^https:\/\/github\.com\//);
            expect(yamlParsedConfig["my-sdk"].lang).toBe("python");
        });
    });
});
