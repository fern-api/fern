import { DOCS_CONFIGURATION_FILENAME, docsYml } from "@fern-api/configuration-loader";
import { validateAgainstJsonSchema } from "@fern-api/core-utils";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CliError, createMockTaskContext } from "@fern-api/task-context";
import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import yaml from "js-yaml";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadDocsConfiguration, loadDocsWorkspace, loadRawDocsConfiguration } from "../loadDocsWorkspace.js";
import { createMockLogger } from "./createMockLogger.js";

vi.mock("@fern-api/core-utils", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@fern-api/core-utils")>();
    return { ...actual, validateAgainstJsonSchema: vi.fn(actual.validateAgainstJsonSchema) };
});

vi.mock("@fern-api/fs-utils", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@fern-api/fs-utils")>();
    return { ...actual, doesPathExist: vi.fn(actual.doesPathExist) };
});

describe("docs workspace loading branches", () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "fern-docs-branches-"));
    });

    afterEach(async () => {
        vi.restoreAllMocks();
        await rm(tmpDir, { recursive: true, force: true });
    });

    function docsYmlPath(directory: string = tmpDir): AbsoluteFilePath {
        return AbsoluteFilePath.of(path.join(directory, "docs.yml"));
    }

    async function writeDocsYml(contents: string, directory: string = tmpDir): Promise<AbsoluteFilePath> {
        await writeFile(docsYmlPath(directory), contents);
        return docsYmlPath(directory);
    }

    async function captureRejection(promise: Promise<unknown>): Promise<CliError> {
        try {
            await promise;
        } catch (error) {
            if (error instanceof CliError) {
                return error;
            }
            throw error;
        }
        throw new Error("Expected the promise to reject with a CliError");
    }

    describe("loadDocsWorkspace", () => {
        it("returns undefined when the directory has no docs.yml", async () => {
            const result = await loadDocsWorkspace({
                fernDirectory: AbsoluteFilePath.of(tmpDir),
                context: createMockTaskContext()
            });
            expect(result).toBeUndefined();
        });

        it("returns a DocsWorkspace when docs.yml is valid", async () => {
            await writeDocsYml("instances:\n  - url: acme.docs.buildwithfern.com\ntitle: Acme\n");
            const fernDirectory = AbsoluteFilePath.of(tmpDir);

            const result = await loadDocsWorkspace({ fernDirectory, context: createMockTaskContext() });

            expect(result).toEqual({
                type: "docs",
                absoluteFilePath: fernDirectory,
                workspaceName: undefined,
                absoluteFilepathToDocsConfig: join(fernDirectory, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME)),
                config: {
                    instances: [{ url: "acme.docs.buildwithfern.com" }],
                    title: "Acme",
                    _redirectsFileErrors: [],
                    _absoluteFilepathsToRedirectsFiles: []
                }
            });
        });

        // loadDocsConfiguration only returns undefined when the directory is missing, which cannot happen after
        // docs.yml itself was found, unless the directory disappears in between. Simulated by stubbing the check.
        it("returns undefined if the directory vanishes after docs.yml was found", async () => {
            await writeDocsYml("instances: []\n");
            vi.mocked(doesPathExist).mockResolvedValueOnce(true).mockResolvedValueOnce(false);

            const result = await loadDocsWorkspace({
                fernDirectory: AbsoluteFilePath.of(tmpDir),
                context: createMockTaskContext()
            });

            expect(result).toBeUndefined();
        });

        it("propagates the parse error when docs.yml is invalid", async () => {
            await writeDocsYml("instances: 5\n");
            const error = await captureRejection(
                loadDocsWorkspace({ fernDirectory: AbsoluteFilePath.of(tmpDir), context: createMockTaskContext() })
            );
            expect(error.code).toBe(CliError.Code.ParseError);
            expect(error.message).toContain("Failed to parse docs.yml:");
        });
    });

    describe("loadDocsConfiguration", () => {
        it("returns undefined when the directory does not exist", async () => {
            const result = await loadDocsConfiguration({
                absolutePathToDocsDefinition: AbsoluteFilePath.of(path.join(tmpDir, "does-not-exist")),
                context: createMockTaskContext()
            });
            expect(result).toBeUndefined();
        });

        it("loads docs.yml from the given directory", async () => {
            await writeDocsYml("instances: []\ntitle: From directory\n");
            const result = await loadDocsConfiguration({
                absolutePathToDocsDefinition: AbsoluteFilePath.of(tmpDir),
                context: createMockTaskContext()
            });
            expect(result?.title).toBe("From directory");
        });

        it("throws a raw ENOENT (not a CliError) when the directory exists but docs.yml does not", async () => {
            await expect(
                loadDocsConfiguration({
                    absolutePathToDocsDefinition: AbsoluteFilePath.of(tmpDir),
                    context: createMockTaskContext()
                })
            ).rejects.toMatchObject({ code: "ENOENT" });
        });
    });

    describe("loadRawDocsConfiguration", () => {
        it("throws a ParseError naming the file when the YAML syntax is invalid", async () => {
            const docsYmlFile = await writeDocsYml("instances: [\n");
            const error = await captureRejection(
                loadRawDocsConfiguration({ absolutePathOfConfiguration: docsYmlFile, context: createMockTaskContext() })
            );
            expect(error.code).toBe(CliError.Code.ParseError);
            expect(error.message.startsWith(`Failed to parse ${docsYmlFile}: `)).toBe(true);
            expect(error.message).toContain("unexpected end of the stream within a flow collection");
        });

        it("rethrows errors from the YAML parser that are not YAML syntax errors", async () => {
            const docsYmlFile = await writeDocsYml("instances: []\n");
            vi.spyOn(yaml, "load").mockImplementation(() => {
                throw new TypeError("unexpected parser failure");
            });

            await expect(
                loadRawDocsConfiguration({ absolutePathOfConfiguration: docsYmlFile, context: createMockTaskContext() })
            ).rejects.toThrow(new TypeError("unexpected parser failure"));
        });

        it.each([
            { name: "wrong type for a required field", contents: "instances: 5\n", expected: "expected array" },
            { name: "missing required property", contents: "title: x\n", expected: "Missing required property" },
            { name: "empty file", contents: "", expected: "expected object but received undefined" },
            { name: "scalar document", contents: "hello", expected: "expected object but received string" },
            { name: "null inside a list", contents: "instances:\n  - url: a.b.c\n  -\n", expected: "received null" },
            {
                name: "null for a required nested field",
                contents: "instances:\n  - url:\n",
                expected: "expected string but received null"
            },
            {
                name: "unexpected property in a redirect",
                contents: "instances: []\nredirects:\n  - source: /a\n    destination: /b\n    foo:\n",
                expected: "Unexpected property 'foo'"
            }
        ])("throws a JSON schema ParseError for $name", async ({ contents, expected }) => {
            const docsYmlFile = await writeDocsYml(contents);
            const error = await captureRejection(
                loadRawDocsConfiguration({ absolutePathOfConfiguration: docsYmlFile, context: createMockTaskContext() })
            );
            expect(error.code).toBe(CliError.Code.ParseError);
            expect(error.message.startsWith("Failed to parse docs.yml:\n")).toBe(true);
            expect(error.message).toContain(expected);
            // the file path is only mentioned in the validator's trailing note
            expect(error.message).toContain(docsYmlFile);
        });

        // The validator only reports a failure without an error object when ajv fails with no error details, which
        // the docs.yml JSON schema cannot produce, so the validator is stubbed to reach the fallback message.
        it("falls back to 'Unknown error' when the JSON schema validator gives no error details", async () => {
            const docsYmlFile = await writeDocsYml("instances: []\n");
            vi.mocked(validateAgainstJsonSchema).mockReturnValueOnce({
                success: false,
                error: undefined,
                allErrors: []
            });

            const error = await captureRejection(
                loadRawDocsConfiguration({ absolutePathOfConfiguration: docsYmlFile, context: createMockTaskContext() })
            );

            expect(error.code).toBe(CliError.Code.ParseError);
            expect(error.message).toBe("Failed to parse docs.yml:\nUnknown error");
        });

        it("does not call the serializer or loggers when JSON schema validation fails", async () => {
            const logger = createMockLogger();
            const docsYmlFile = await writeDocsYml("instances: 5\n");
            await captureRejection(
                loadRawDocsConfiguration({
                    absolutePathOfConfiguration: docsYmlFile,
                    context: createMockTaskContext({ logger })
                })
            );
            expect(logger.debug).not.toHaveBeenCalled();
            expect(logger.warn).not.toHaveBeenCalled();
            expect(logger.error).not.toHaveBeenCalled();
        });

        it("logs debug messages and no warning when there are no null sections", async () => {
            const logger = createMockLogger();
            const docsYmlFile = await writeDocsYml("instances: []\ntitle: Plain\n");

            const result = await loadRawDocsConfiguration({
                absolutePathOfConfiguration: docsYmlFile,
                context: createMockTaskContext({ logger })
            });

            expect(result).toEqual({
                instances: [],
                title: "Plain",
                _redirectsFileErrors: [],
                _absoluteFilepathsToRedirectsFiles: []
            });
            expect(logger.warn).not.toHaveBeenCalled();
            expect(logger.error).not.toHaveBeenCalled();
            expect(logger.debug.mock.calls.map(([message]) => message)).toEqual([
                "About to sanitize docs configuration JSON structure",
                "No null/undefined values found during sanitization",
                "Attempting to parse sanitized docs configuration"
            ]);
        });

        it.each([
            {
                name: "a top-level null section",
                contents: "instances: []\nnavigation:\ntitle:\n",
                warning: "docs.yml contained null/undefined sections that were ignored: navigation, title",
                expectedConfig: { instances: [] }
            },
            {
                name: "nested null values",
                contents: "instances: []\nlayout:\n  tabs-placement:\n  searchbar-placement:\n",
                warning:
                    "docs.yml contained null/undefined sections that were ignored: layout.tabs-placement, layout.searchbar-placement",
                expectedConfig: { instances: [], layout: {} }
            },
            {
                name: "null inside list items (index appears in the path)",
                contents:
                    "instances: []\nnavigation:\n  - section: S\n    contents:\n      - page: A\n        path: a.md\n        slug:\n",
                warning: "docs.yml contained null/undefined sections that were ignored: navigation.0.contents.0.slug",
                expectedConfig: {
                    instances: [],
                    navigation: [{ section: "S", contents: [{ page: "A", path: "a.md" }] }]
                }
            },
            {
                name: "a null in an instance",
                contents: "instances: [{url: a.docs.buildwithfern.com, custom-domain: }]\n",
                warning: "docs.yml contained null/undefined sections that were ignored: instances.0.custom-domain",
                expectedConfig: { instances: [{ url: "a.docs.buildwithfern.com" }] }
            }
        ])("warns and strips $name", async ({ contents, warning, expectedConfig }) => {
            const logger = createMockLogger();
            const docsYmlFile = await writeDocsYml(contents);

            const result = await loadRawDocsConfiguration({
                absolutePathOfConfiguration: docsYmlFile,
                context: createMockTaskContext({ logger })
            });

            expect(logger.warn).toHaveBeenCalledTimes(1);
            expect(logger.warn).toHaveBeenCalledWith(warning);
            expect(result).toEqual({
                ...expectedConfig,
                _redirectsFileErrors: [],
                _absoluteFilepathsToRedirectsFiles: []
            });
            // The "no null values" debug message is only logged on the else branch
            expect(logger.debug).not.toHaveBeenCalledWith("No null/undefined values found during sanitization");
        });

        it("logs an error and throws a ParseError when the serializer rejects the sanitized configuration", async () => {
            // Every input the JSON schema accepts is also accepted by the serializer today, so the serializer is
            // stubbed to reach this branch.
            const logger = createMockLogger();
            const docsYmlFile = await writeDocsYml("instances: []\n");
            vi.spyOn(docsYml.RawSchemas.Serializer.DocsConfiguration, "parseOrThrow").mockImplementation(() => {
                throw new Error("serializer exploded");
            });

            const error = await captureRejection(
                loadRawDocsConfiguration({
                    absolutePathOfConfiguration: docsYmlFile,
                    context: createMockTaskContext({ logger })
                })
            );

            expect(error.code).toBe(CliError.Code.ParseError);
            expect(error.message).toBe(`Failed to parse ${docsYmlFile}: serializer exploded`);
            expect(logger.error).toHaveBeenCalledTimes(1);
            expect(logger.error).toHaveBeenCalledWith("Parsing failed even after sanitization: serializer exploded");
            expect(logger.debug).toHaveBeenCalledWith(
                `Sanitized JSON structure: ${JSON.stringify({ instances: [] }, null, 2)}`
            );
        });

        describe("redirects", () => {
            it("leaves inline redirects untouched and reports no redirects files", async () => {
                const docsYmlFile = await writeDocsYml(
                    "instances: []\nredirects:\n  - source: /a\n    destination: /b\n    permanent: true\n"
                );
                const result = await loadRawDocsConfiguration({
                    absolutePathOfConfiguration: docsYmlFile,
                    context: createMockTaskContext()
                });
                expect(result.redirects).toEqual([{ source: "/a", destination: "/b", permanent: true }]);
                expect(result._redirectsFileErrors).toEqual([]);
                expect(result._absoluteFilepathsToRedirectsFiles).toEqual([]);
            });

            it("loads redirects from a referenced file and records its absolute path", async () => {
                await mkdir(path.join(tmpDir, "config"));
                await writeFile(
                    path.join(tmpDir, "config", "redirects.yml"),
                    "redirects:\n  - source: /old\n    destination: /new\n"
                );
                const docsYmlFile = await writeDocsYml("instances: []\nredirects:\n  - config/redirects.yml\n");

                const result = await loadRawDocsConfiguration({
                    absolutePathOfConfiguration: docsYmlFile,
                    context: createMockTaskContext()
                });

                expect(result.redirects).toEqual([{ source: "/old", destination: "/new" }]);
                expect(result._redirectsFileErrors).toEqual([]);
                expect(result._absoluteFilepathsToRedirectsFiles).toEqual([
                    path.join(tmpDir, "config", "redirects.yml")
                ]);
            });

            it("accepts a single filepath string for redirects", async () => {
                await writeFile(path.join(tmpDir, "r.yml"), "redirects:\n  - source: /x\n    destination: /y\n");
                const docsYmlFile = await writeDocsYml("instances: []\nredirects: r.yml\n");

                const result = await loadRawDocsConfiguration({
                    absolutePathOfConfiguration: docsYmlFile,
                    context: createMockTaskContext()
                });

                expect(result.redirects).toEqual([{ source: "/x", destination: "/y" }]);
                expect(result._absoluteFilepathsToRedirectsFiles).toEqual([path.join(tmpDir, "r.yml")]);
            });

            it("carries redirects file errors on the configuration instead of throwing", async () => {
                const docsYmlFile = await writeDocsYml("instances: []\nredirects:\n  - missing.yml\n");

                const result = await loadRawDocsConfiguration({
                    absolutePathOfConfiguration: docsYmlFile,
                    context: createMockTaskContext()
                });

                expect(result.redirects).toEqual([]);
                expect(result._redirectsFileErrors).toEqual([
                    `Failed to load redirects: ${path.join(tmpDir, "missing.yml")} does not exist`
                ]);
                expect(result._absoluteFilepathsToRedirectsFiles).toEqual([path.join(tmpDir, "missing.yml")]);
            });

            it("reports an empty filepath as an error but does not list it as a redirects file", async () => {
                const docsYmlFile = await writeDocsYml("instances: []\nredirects:\n  - ''\n");

                const result = await loadRawDocsConfiguration({
                    absolutePathOfConfiguration: docsYmlFile,
                    context: createMockTaskContext()
                });

                expect(result.redirects).toEqual([]);
                expect(result._redirectsFileErrors).toEqual([
                    "Failed to load redirects: `redirects` contains an empty filepath"
                ]);
                expect(result._absoluteFilepathsToRedirectsFiles).toEqual([]);
            });

            it("collects errors from every redirects file and still returns redirects from the valid ones", async () => {
                await writeFile(path.join(tmpDir, "good.yml"), "redirects:\n  - source: /g\n    destination: /h\n");
                await writeFile(path.join(tmpDir, "list.yml"), "- source: /a\n  destination: /b\n");
                const docsYmlFile = await writeDocsYml(
                    "instances: []\nredirects:\n  - good.yml\n  - list.yml\n  - absent.yml\n"
                );

                const result = await loadRawDocsConfiguration({
                    absolutePathOfConfiguration: docsYmlFile,
                    context: createMockTaskContext()
                });

                expect(result.redirects).toEqual([{ source: "/g", destination: "/h" }]);
                expect(result._redirectsFileErrors).toEqual([
                    `Failed to parse ${path.join(tmpDir, "list.yml")}: the file must nest the list under a top-level \`redirects\` key`,
                    `Failed to load redirects: ${path.join(tmpDir, "absent.yml")} does not exist`
                ]);
                expect(result._absoluteFilepathsToRedirectsFiles).toEqual([
                    path.join(tmpDir, "good.yml"),
                    path.join(tmpDir, "list.yml"),
                    path.join(tmpDir, "absent.yml")
                ]);
            });
        });

        // Oddities pinned from the actual behavior: the language/locale values are not validated at all.
        it("accepts arbitrary strings as locale codes (no locale validation)", async () => {
            const docsYmlFile = await writeDocsYml("instances: []\nlanguages: ['not a locale!!']\n");
            const result = await loadRawDocsConfiguration({
                absolutePathOfConfiguration: docsYmlFile,
                context: createMockTaskContext()
            });
            expect(result.languages).toEqual(["not a locale!!"]);
        });
    });
});
