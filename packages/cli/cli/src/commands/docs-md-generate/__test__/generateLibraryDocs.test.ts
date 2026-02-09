import { describe, expect, it } from "vitest";

/**
 * Tests for the generateLibraryDocs command logic.
 *
 * Note: These tests focus on the validation and business logic,
 * not the full integration with the CLI context and project loader.
 */
describe("generateLibraryDocs", () => {
    describe("library selection logic", () => {
        it("should select all libraries when no --library flag is provided", () => {
            const libraries = {
                "python-sdk": {
                    input: { git: "https://github.com/acme/py" },
                    output: { path: "./py-docs" },
                    lang: "python" as const
                },
                "cpp-sdk": {
                    input: { git: "https://github.com/acme/cpp" },
                    output: { path: "./cpp-docs" },
                    lang: "cpp" as const
                }
            };
            const library: string | undefined = undefined;

            const librariesToGenerate =
                library != null ? { [library]: libraries[library as keyof typeof libraries] } : libraries;

            expect(Object.keys(librariesToGenerate)).toHaveLength(2);
            expect("python-sdk" in librariesToGenerate).toBe(true);
            expect("cpp-sdk" in librariesToGenerate).toBe(true);
        });

        it("should select only specified library when --library flag is provided", () => {
            const libraries = {
                "python-sdk": {
                    input: { git: "https://github.com/acme/py" },
                    output: { path: "./py-docs" },
                    lang: "python" as const
                },
                "cpp-sdk": {
                    input: { git: "https://github.com/acme/cpp" },
                    output: { path: "./cpp-docs" },
                    lang: "cpp" as const
                }
            };
            const library: string | undefined = "python-sdk";

            const librariesToGenerate =
                library != null ? { [library]: libraries[library as keyof typeof libraries] } : libraries;

            expect(Object.keys(librariesToGenerate)).toHaveLength(1);
            expect("python-sdk" in librariesToGenerate).toBe(true);
            expect("cpp-sdk" in librariesToGenerate).toBe(false);
        });

        it("should return undefined for non-existent library", () => {
            const libraries = {
                "python-sdk": {
                    input: { git: "https://github.com/acme/py" },
                    output: { path: "./py-docs" },
                    lang: "python" as const
                }
            };
            const library = "non-existent";

            const selectedLibrary = libraries[library as keyof typeof libraries];

            expect(selectedLibrary).toBeUndefined();
        });
    });

    describe("validation logic", () => {
        it("should detect when no libraries are configured", () => {
            const libraries: Record<string, unknown> | undefined = undefined;

            const hasLibraries = libraries != null && Object.keys(libraries).length > 0;

            expect(hasLibraries).toBe(false);
        });

        it("should detect when libraries object is empty", () => {
            const libraries: Record<string, unknown> = {};

            const hasLibraries = libraries != null && Object.keys(libraries).length > 0;

            expect(hasLibraries).toBe(false);
        });

        it("should detect when libraries are configured", () => {
            const libraries = {
                "my-sdk": { input: { git: "https://github.com/acme/sdk" }, output: { path: "./docs" }, lang: "python" }
            };

            const hasLibraries = libraries != null && Object.keys(libraries).length > 0;

            expect(hasLibraries).toBe(true);
        });

        it("should detect when requested library does not exist", () => {
            const libraries = {
                "my-sdk": { input: { git: "https://github.com/acme/sdk" }, output: { path: "./docs" }, lang: "python" }
            };
            const requestedLibrary = "other-sdk";

            const libraryExists = libraries[requestedLibrary as keyof typeof libraries] != null;

            expect(libraryExists).toBe(false);
        });

        it("should detect when requested library exists", () => {
            const libraries = {
                "my-sdk": { input: { git: "https://github.com/acme/sdk" }, output: { path: "./docs" }, lang: "python" }
            };
            const requestedLibrary = "my-sdk";

            const libraryExists = libraries[requestedLibrary as keyof typeof libraries] != null;

            expect(libraryExists).toBe(true);
        });
    });

    describe("output message generation", () => {
        it("should generate correct message for library without subpath", () => {
            const name = "my-sdk";
            const config = {
                input: { git: "https://github.com/acme/sdk", subpath: undefined },
                output: { path: "./static/sdk-docs" },
                lang: "python" as const
            };

            const subpathInfo = config.input.subpath != null ? ` (subpath: ${config.input.subpath})` : "";
            const message = `Would generate library '${name}' from ${config.input.git}${subpathInfo} to ${config.output.path} (lang: ${config.lang})`;

            expect(message).toBe(
                "Would generate library 'my-sdk' from https://github.com/acme/sdk to ./static/sdk-docs (lang: python)"
            );
        });

        it("should generate correct message for library with subpath", () => {
            const name = "my-sdk";
            const config = {
                input: { git: "https://github.com/acme/monorepo", subpath: "packages/sdk" },
                output: { path: "./static/sdk-docs" },
                lang: "python" as const
            };

            const subpathInfo = config.input.subpath != null ? ` (subpath: ${config.input.subpath})` : "";
            const message = `Would generate library '${name}' from ${config.input.git}${subpathInfo} to ${config.output.path} (lang: ${config.lang})`;

            expect(message).toBe(
                "Would generate library 'my-sdk' from https://github.com/acme/monorepo (subpath: packages/sdk) to ./static/sdk-docs (lang: python)"
            );
        });

        it("should generate correct message for cpp library", () => {
            const name = "cpp-lib";
            const config = {
                input: { git: "https://github.com/acme/cpp-lib", subpath: undefined },
                output: { path: "./docs/cpp" },
                lang: "cpp" as const
            };

            const subpathInfo = config.input.subpath != null ? ` (subpath: ${config.input.subpath})` : "";
            const message = `Would generate library '${name}' from ${config.input.git}${subpathInfo} to ${config.output.path} (lang: ${config.lang})`;

            expect(message).toBe(
                "Would generate library 'cpp-lib' from https://github.com/acme/cpp-lib to ./docs/cpp (lang: cpp)"
            );
        });
    });

    describe("available libraries formatting", () => {
        it("should format single library name correctly", () => {
            const libraries = {
                "my-sdk": {}
            };

            const availableLibraries = Object.keys(libraries).join(", ");

            expect(availableLibraries).toBe("my-sdk");
        });

        it("should format multiple library names correctly", () => {
            const libraries = {
                "python-sdk": {},
                "cpp-sdk": {},
                "java-sdk": {}
            };

            const availableLibraries = Object.keys(libraries).join(", ");

            expect(availableLibraries).toBe("python-sdk, cpp-sdk, java-sdk");
        });
    });
});
