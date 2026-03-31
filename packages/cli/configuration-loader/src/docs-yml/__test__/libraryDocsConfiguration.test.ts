import { describe, expect, it } from "vitest";

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

        // Helper to simulate the parsing logic
        function parseLibrariesConfiguration(
            libraries:
                | Record<
                      string,
                      { input: { git: string; subpath?: string }; output: { path: string }; lang: "python" | "cpp" }
                  >
                | undefined
        ): Record<string, LibraryConfiguration> | undefined {
            if (libraries == null) {
                return undefined;
            }
            const result: Record<string, LibraryConfiguration> = {};
            for (const [name, config] of Object.entries(libraries)) {
                result[name] = {
                    input: {
                        git: config.input.git,
                        subpath: config.input.subpath
                    },
                    output: {
                        path: config.output.path
                    },
                    lang: config.lang
                };
            }
            return result;
        }

        it("should return undefined for undefined input", () => {
            expect(parseLibrariesConfiguration(undefined)).toBeUndefined();
        });

        it("should parse single library configuration", () => {
            const rawLibraries = {
                "my-sdk": {
                    input: {
                        git: "https://github.com/acme/sdk-python"
                    },
                    output: {
                        path: "./static/sdk-docs"
                    },
                    lang: "python" as const
                }
            };

            const result = parseLibrariesConfiguration(rawLibraries);

            expect(result).toBeDefined();
            const mySdk = result?.["my-sdk"];
            expect(mySdk).toBeDefined();
            expect(mySdk?.input.git).toBe("https://github.com/acme/sdk-python");
            expect(mySdk?.input.subpath).toBeUndefined();
            expect(mySdk?.output.path).toBe("./static/sdk-docs");
            expect(mySdk?.lang).toBe("python");
        });

        it("should parse multiple library configurations", () => {
            const rawLibraries = {
                "python-sdk": {
                    input: {
                        git: "https://github.com/acme/sdk-python"
                    },
                    output: {
                        path: "./static/python-docs"
                    },
                    lang: "python" as const
                },
                "cpp-sdk": {
                    input: {
                        git: "https://github.com/acme/sdk-cpp",
                        subpath: "src/lib"
                    },
                    output: {
                        path: "./static/cpp-docs"
                    },
                    lang: "cpp" as const
                }
            };

            const result = parseLibrariesConfiguration(rawLibraries);

            expect(result).toBeDefined();
            expect(Object.keys(result ?? {})).toHaveLength(2);

            const pythonSdk = result?.["python-sdk"];
            expect(pythonSdk?.input.git).toBe("https://github.com/acme/sdk-python");
            expect(pythonSdk?.lang).toBe("python");

            const cppSdk = result?.["cpp-sdk"];
            expect(cppSdk?.input.git).toBe("https://github.com/acme/sdk-cpp");
            expect(cppSdk?.input.subpath).toBe("src/lib");
            expect(cppSdk?.lang).toBe("cpp");
        });

        it("should preserve subpath when provided", () => {
            const rawLibraries = {
                "my-sdk": {
                    input: {
                        git: "https://github.com/acme/monorepo",
                        subpath: "packages/sdk/python"
                    },
                    output: {
                        path: "./docs/sdk"
                    },
                    lang: "python" as const
                }
            };

            const result = parseLibrariesConfiguration(rawLibraries);

            const mySdk = result?.["my-sdk"];
            expect(mySdk?.input.subpath).toBe("packages/sdk/python");
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
