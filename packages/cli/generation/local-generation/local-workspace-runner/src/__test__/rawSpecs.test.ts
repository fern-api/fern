import { getOpenAPISettings } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { createHash } from "crypto";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";
import * as tar from "tar";
import tmp from "tmp-promise";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
    collectRawSpecs,
    createGroupedSpecsTarGzArchive,
    createGroupedSpecsTarGzArchiveSettled,
    createSpecsTarGzArchive,
    filterSpec,
    validateSdkConfigImportSettings
} from "../rawSpecs.js";

// biome-ignore lint/suspicious/noExplicitAny: mock context for testing
function createMockContext(): any {
    return {
        logger: {
            // biome-ignore lint/suspicious/noEmptyBlockStatements: noop logger
            debug: () => {},
            // biome-ignore lint/suspicious/noEmptyBlockStatements: noop logger
            info: () => {},
            // biome-ignore lint/suspicious/noEmptyBlockStatements: noop logger
            warn: () => {},
            // biome-ignore lint/suspicious/noEmptyBlockStatements: noop logger
            error: () => {},
            // biome-ignore lint/suspicious/noEmptyBlockStatements: noop logger
            trace: () => {},
            // biome-ignore lint/suspicious/noEmptyBlockStatements: noop logger
            log: () => {}
        },
        failAndThrow: () => {
            throw new Error("Task failed");
        },
        // biome-ignore lint/suspicious/noEmptyBlockStatements: noop mock
        failWithoutThrowing: () => {},
        isCancelled: false,
        // biome-ignore lint/suspicious/noEmptyBlockStatements: noop mock
        runInteractiveTask: async () => {},
        // biome-ignore lint/suspicious/noEmptyBlockStatements: noop mock
        takeOverTerminal: async () => {}
    };
}

const MINIMAL_OPENAPI = ['openapi: "3.0.0"', "info:", "  title: Test", '  version: "1.0"', "paths: {}", ""].join("\n");

function openApiSpec(filepath: string) {
    const absoluteFilepath = AbsoluteFilePath.of(filepath);
    return {
        type: "openapi" as const,
        absoluteFilepath,
        absoluteFilepathToOverrides: undefined,
        absoluteFilepathToOverlays: undefined,
        source: {
            type: "openapi" as const,
            file: absoluteFilepath,
            relativePathToDependency: undefined
        }
    };
}

describe("collectRawSpecs", () => {
    let tmpDir: tmp.DirectoryResult;
    let sourceDir: string;

    beforeEach(async () => {
        tmpDir = await tmp.dir({ unsafeCleanup: true });
        sourceDir = path.join(tmpDir.path, "source");
        await mkdir(path.join(sourceDir, "api"), { recursive: true });
        await mkdir(path.join(sourceDir, "overrides"), { recursive: true });
        await mkdir(path.join(sourceDir, "overlays"), { recursive: true });
        await mkdir(path.join(sourceDir, "proto", "service"), { recursive: true });
    });

    afterEach(async () => {
        await rm(tmpDir.path, { recursive: true, force: true });
    });

    it("returns empty manifest for empty specs array", async () => {
        const outputDir = path.join(tmpDir.path, "output");
        await mkdir(outputDir, { recursive: true });

        const manifest = await collectRawSpecs({
            specs: [],
            hostOutputDir: AbsoluteFilePath.of(outputDir),
            containerBaseDir: "/fern/specs",
            context: createMockContext()
        });

        expect(manifest.specs).toHaveLength(0);
    });

    it("resolves a single OpenAPI spec to compact JSON", async () => {
        const specFile = path.join(sourceDir, "api", "openapi.yaml");
        await writeFile(specFile, MINIMAL_OPENAPI);

        const outputDir = path.join(tmpDir.path, "output");
        await mkdir(outputDir, { recursive: true });

        const manifest = await collectRawSpecs({
            specs: [
                {
                    type: "openapi",
                    absoluteFilepath: AbsoluteFilePath.of(specFile),
                    absoluteFilepathToOverrides: undefined,
                    absoluteFilepathToOverlays: undefined,
                    source: {
                        type: "openapi",
                        file: AbsoluteFilePath.of(specFile),
                        relativePathToDependency: undefined
                    },
                    settings: getOpenAPISettings({
                        overrides: {
                            respectNullableSchemas: false,
                            useTitlesAsName: true,
                            pathParameterOrder: "spec-order",
                            defaultIntegerFormat: "int64"
                        }
                    })
                }
            ],
            hostOutputDir: AbsoluteFilePath.of(outputDir),
            containerBaseDir: "/fern/specs",
            context: createMockContext()
        });

        expect(manifest.specs).toHaveLength(1);
        expect(manifest.specs[0]?.type).toBe("openapi");
        expect(manifest.specs[0]?.specPath).toBe("/fern/specs/openapi0.json");
        expect(manifest.specs[0]?.overridePaths).toBeUndefined();
        expect(manifest.specs[0]?.apiImportSettings).toMatchObject({
            respectNullableSchemas: false,
            titleAsSchemaName: true,
            pathParameterOrder: "spec-order",
            defaultIntegerFormat: "int64"
        });

        const content = await readFile(path.join(outputDir, "openapi0.json"), "utf-8");
        const parsed = JSON.parse(content);
        expect(parsed.openapi).toBe("3.0.0");
        expect(parsed.info.title).toBe("Test");
        // Compact JSON has no newlines
        expect(content).not.toContain("\n");
    });

    it("creates byte-identical source archives for identical inputs", async () => {
        const specFile = path.join(sourceDir, "api", "deterministic.yaml");
        await writeFile(specFile, MINIMAL_OPENAPI);
        const spec = {
            type: "openapi" as const,
            absoluteFilepath: AbsoluteFilePath.of(specFile),
            absoluteFilepathToOverrides: undefined,
            absoluteFilepathToOverlays: undefined,
            source: {
                type: "openapi" as const,
                file: AbsoluteFilePath.of(specFile),
                relativePathToDependency: undefined
            }
        };

        const first = await createSpecsTarGzArchive({ specs: [spec], context: createMockContext() });
        await new Promise((resolve) => setTimeout(resolve, 20));
        const second = await createSpecsTarGzArchive({ specs: [spec], context: createMockContext() });

        expect(second.manifest).toEqual(first.manifest);
        expect(second.buffer.equals(first.buffer)).toBe(true);
        expect(createHash("sha256").update(second.buffer).digest("hex")).toBe(
            createHash("sha256").update(first.buffer).digest("hex")
        );
        expect(first.buffer.subarray(4, 8)).toEqual(Buffer.alloc(4));
    });

    it("normalizes file modes in archive metadata", async () => {
        const protoRoot = path.join(sourceDir, "proto");
        const protoFile = path.join(protoRoot, "service", "api.proto");
        await writeFile(protoFile, 'syntax = "proto3";', { mode: 0o755 });

        const archive = await createSpecsTarGzArchive({
            specs: [
                {
                    type: "protobuf",
                    absoluteFilepathToProtobufRoot: AbsoluteFilePath.of(protoRoot),
                    absoluteFilepathToProtobufTarget: undefined,
                    absoluteFilepathToOverrides: undefined,
                    relativeFilepathToProtobufRoot: RelativeFilePath.of("proto"),
                    generateLocally: false,
                    fromOpenAPI: false,
                    dependencies: []
                }
            ],
            context: createMockContext()
        });
        const archivePath = path.join(tmpDir.path, "normalized-modes.tar.gz");
        await writeFile(archivePath, archive.buffer);
        const modes = new Map<string, number | undefined>();
        await tar.list({
            file: archivePath,
            onReadEntry: (entry) => modes.set(entry.path, entry.mode)
        });

        expect(modes.get("protobuf0/service/api.proto")).toBe(0o644);
        expect(modes.get("specs-manifest.json")).toBe(0o644);
        expect(modes.has("specs.tar.gz")).toBe(false);
    });

    it("deduplicates grouped sources and retains per-generator manifest indexes", async () => {
        const firstFile = path.join(sourceDir, "api", "first.yaml");
        const secondFile = path.join(sourceDir, "api", "second.yaml");
        await writeFile(firstFile, MINIMAL_OPENAPI);
        await writeFile(secondFile, MINIMAL_OPENAPI.replace("title: Test", "title: Second"));
        const first = openApiSpec(firstFile);
        const second = openApiSpec(secondFile);

        const archive = await createGroupedSpecsTarGzArchive({
            generatorSelections: [
                { generatorIndex: 3, specs: [first] },
                { generatorIndex: 1, specs: [first, first, second] }
            ],
            context: createMockContext()
        });

        expect(archive.manifest.specs.map((entry) => entry.specPath)).toEqual([
            "/fern/specs/openapi0.json",
            "/fern/specs/openapi1.json"
        ]);
        expect(archive.specIndexesByGeneratorIndex.get(1)).toEqual([0, 1]);
        expect(archive.specIndexesByGeneratorIndex.get(3)).toEqual([0]);
    });

    it("deduplicates specs with implicit and explicit default import settings", async () => {
        const specFile = path.join(sourceDir, "api", "defaults.yaml");
        await writeFile(specFile, MINIMAL_OPENAPI);
        const spec = openApiSpec(specFile);
        const explicitDefaultsSpec = { ...spec, settings: getOpenAPISettings() };

        const implicitArchive = await createSpecsTarGzArchive({ specs: [spec], context: createMockContext() });
        const explicitArchive = await createSpecsTarGzArchive({
            specs: [explicitDefaultsSpec],
            context: createMockContext()
        });

        expect(explicitArchive.manifest).toEqual(implicitArchive.manifest);
        expect(explicitArchive.buffer.equals(implicitArchive.buffer)).toBe(true);

        const archive = await createGroupedSpecsTarGzArchive({
            generatorSelections: [
                { generatorIndex: 0, specs: [spec] },
                { generatorIndex: 1, specs: [explicitDefaultsSpec] }
            ],
            context: createMockContext()
        });

        expect(archive.manifest.specs).toHaveLength(1);
        expect(archive.specIndexesByGeneratorIndex).toEqual(
            new Map([
                [0, [0]],
                [1, [0]]
            ])
        );
    });

    it("excludes a failed generator before constructing the aggregate source archive", async () => {
        const validFile = path.join(sourceDir, "api", "valid.yaml");
        await writeFile(validFile, MINIMAL_OPENAPI);
        const invalidFile = path.join(sourceDir, "api", "missing.yaml");

        const result = await createGroupedSpecsTarGzArchiveSettled({
            generatorSelections: [
                { generatorIndex: 0, specs: [openApiSpec(validFile)] },
                { generatorIndex: 1, specs: [openApiSpec(invalidFile)] }
            ],
            context: createMockContext()
        });

        expect(result.errorsByGeneratorIndex.has(0)).toBe(false);
        expect(result.errorsByGeneratorIndex.get(1)).toBeInstanceOf(Error);
        expect(result.archive?.specIndexesByGeneratorIndex).toEqual(new Map([[0, [0]]]));
        expect(result.archive?.manifest.specs).toHaveLength(1);
    });

    it("keeps a shared valid source when only one referring generator has another failing source", async () => {
        const validFile = path.join(sourceDir, "api", "shared-valid.yaml");
        await writeFile(validFile, MINIMAL_OPENAPI);
        const validSpec = openApiSpec(validFile);
        const invalidSpec = openApiSpec(path.join(sourceDir, "api", "missing.yaml"));

        const result = await createGroupedSpecsTarGzArchiveSettled({
            generatorSelections: [
                { generatorIndex: 0, specs: [validSpec] },
                { generatorIndex: 1, specs: [validSpec, invalidSpec] }
            ],
            context: createMockContext()
        });

        expect(result.errorsByGeneratorIndex.has(0)).toBe(false);
        expect(result.errorsByGeneratorIndex.get(1)).toBeInstanceOf(Error);
        expect(result.archive?.manifest.specs).toHaveLength(1);
        expect(result.archive?.specIndexesByGeneratorIndex).toEqual(new Map([[0, [0]]]));
    });

    it("aggregates independent source preparation failures", async () => {
        let failure: unknown;
        try {
            await createGroupedSpecsTarGzArchive({
                generatorSelections: [
                    { generatorIndex: 0, specs: [openApiSpec(path.join(sourceDir, "api", "first-missing.yaml"))] },
                    { generatorIndex: 1, specs: [openApiSpec(path.join(sourceDir, "api", "second-missing.yaml"))] }
                ],
                context: createMockContext()
            });
        } catch (error) {
            failure = error;
        }

        expect(failure).toBeInstanceOf(AggregateError);
        if (!(failure instanceof AggregateError)) {
            throw new Error("Expected grouped source preparation to throw AggregateError");
        }
        expect(failure.errors).toHaveLength(2);
    });

    it("throws one shared source preparation failure without duplicating it", async () => {
        const missingSpec = openApiSpec(path.join(sourceDir, "api", "shared-missing.yaml"));
        let failure: unknown;
        try {
            await createGroupedSpecsTarGzArchive({
                generatorSelections: [
                    { generatorIndex: 0, specs: [missingSpec] },
                    { generatorIndex: 1, specs: [missingSpec] }
                ],
                context: createMockContext()
            });
        } catch (error) {
            failure = error;
        }

        expect(failure).toBeInstanceOf(Error);
        expect(failure).not.toBeInstanceOf(AggregateError);
    });

    it("maps one shared materialization failure to every referring generator", async () => {
        const missingSpec = openApiSpec(path.join(sourceDir, "api", "shared-missing.yaml"));
        const selections = [
            { generatorIndex: 2, specs: [missingSpec] },
            { generatorIndex: 4, specs: [missingSpec] }
        ];

        const result = await createGroupedSpecsTarGzArchiveSettled({
            generatorSelections: selections,
            context: createMockContext()
        });

        expect(result.archive).toBeUndefined();
        expect(result.errorsByGeneratorIndex.get(2)).toBeInstanceOf(Error);
        expect(result.errorsByGeneratorIndex.get(4)).toBeInstanceOf(Error);
        for (const { generatorIndex } of selections) {
            expect(result.archive?.specIndexesByGeneratorIndex.has(generatorIndex) ?? false).not.toBe(
                result.errorsByGeneratorIndex.has(generatorIndex)
            );
        }
    });

    it("wraps non-Error materialization failures without discarding their cause", async () => {
        const specFile = path.join(sourceDir, "api", "valid.yaml");
        await writeFile(specFile, MINIMAL_OPENAPI);
        const rejection = { code: "SOURCE_LOG_FAILED" };
        const context = createMockContext();
        context.logger.debug = () => {
            throw rejection;
        };

        await expect(
            createGroupedSpecsTarGzArchive({
                generatorSelections: [{ generatorIndex: 0, specs: [openApiSpec(specFile)] }],
                context
            })
        ).rejects.toMatchObject({
            message: "Grouped source archive preparation failed",
            cause: rejection
        });
    });

    it("applies OpenAPI overrides and overlays before writing the correlated archive source", async () => {
        const specFile = path.join(sourceDir, "api", "transforms.yaml");
        const overrideFile = path.join(sourceDir, "overrides", "override.yaml");
        const overlayFile = path.join(sourceDir, "overlays", "overlay.yaml");
        await writeFile(specFile, MINIMAL_OPENAPI);
        await writeFile(overrideFile, 'info:\n  description: "from override"\n');
        await writeFile(overlayFile, ["overlay: 1.0.0", "info:", "  title: test", "actions: []", ""].join("\n"));
        const spec = {
            ...openApiSpec(specFile),
            absoluteFilepathToOverrides: AbsoluteFilePath.of(overrideFile),
            absoluteFilepathToOverlays: AbsoluteFilePath.of(overlayFile)
        };

        const archive = await createGroupedSpecsTarGzArchive({
            generatorSelections: [{ generatorIndex: 0, specs: [spec] }],
            context: createMockContext()
        });
        const archivePath = path.join(tmpDir.path, "sources.tar.gz");
        const extractDir = path.join(tmpDir.path, "extracted");
        await writeFile(archivePath, archive.buffer);
        await mkdir(extractDir);
        await tar.extract({ file: archivePath, cwd: extractDir });

        expect(archive.manifest.specs[0]).toMatchObject({ specPath: "/fern/specs/openapi0.json" });
        expect(archive.manifest.specs[0]).not.toHaveProperty("overridePaths");
        expect(archive.manifest.specs[0]).not.toHaveProperty("overlayPaths");
        await expect(readFile(path.join(extractDir, "openapi0-override-0.yaml"), "utf8")).rejects.toThrow();
        await expect(readFile(path.join(extractDir, "openapi0-overlay-0.yaml"), "utf8")).rejects.toThrow();
        expect(JSON.parse(await readFile(path.join(extractDir, "openapi0.json"), "utf8")).info.description).toBe(
            "from override"
        );
    });

    it("applies AsyncAPI overrides without emitting transform manifest paths", async () => {
        const specFile = path.join(sourceDir, "api", "events.yaml");
        const overrideFile = path.join(sourceDir, "overrides", "events-override.yaml");
        await writeFile(
            specFile,
            ["asyncapi: 2.6.0", "info:", "  title: Events", "  version: 1.0.0", "channels: {}", ""].join("\n")
        );
        await writeFile(overrideFile, 'info:\n  description: "resolved async override"\n');
        const spec = {
            ...openApiSpec(specFile),
            absoluteFilepathToOverrides: AbsoluteFilePath.of(overrideFile)
        };

        const archive = await createGroupedSpecsTarGzArchive({
            generatorSelections: [{ generatorIndex: 0, specs: [spec] }],
            context: createMockContext()
        });

        expect(archive.manifest.specs[0]).toMatchObject({
            type: "asyncapi",
            specPath: "/fern/specs/asyncapi0.json"
        });
        expect(archive.manifest.specs[0]).not.toHaveProperty("overridePaths");
        expect(archive.manifest.specs[0]).not.toHaveProperty("overlayPaths");
        const archivePath = path.join(tmpDir.path, "async-sources.tar.gz");
        const extractDir = path.join(tmpDir.path, "async-extracted");
        await writeFile(archivePath, archive.buffer);
        await mkdir(extractDir);
        await tar.extract({ file: archivePath, cwd: extractDir });
        expect(JSON.parse(await readFile(path.join(extractDir, "asyncapi0.json"), "utf8")).info.description).toBe(
            "resolved async override"
        );
    });

    it("rejects effective import settings that SDK Config cannot preserve", () => {
        const spec = {
            ...openApiSpec(path.join(sourceDir, "api", "readonly.yaml")),
            settings: getOpenAPISettings({ overrides: { respectReadonlySchemas: true } })
        };

        expect(() => validateSdkConfigImportSettings([spec])).toThrow(
            "cannot preserve effective OpenAPI import setting respectReadonlySchemas=true"
        );
        expect(() => validateSdkConfigImportSettings([spec])).toThrow("use a pre-cutover generator version");
    });

    it("accepts an empty default audience filter for SDK Config", () => {
        const spec = {
            ...openApiSpec(path.join(sourceDir, "api", "default-audiences.yaml")),
            settings: getOpenAPISettings({ overrides: { audiences: [] } })
        };

        expect(() => validateSdkConfigImportSettings([spec])).not.toThrow();
    });

    it("merges overrides into the resolved OpenAPI spec", async () => {
        const specFile = path.join(sourceDir, "api", "openapi.yaml");
        const overrideFile = path.join(sourceDir, "overrides", "override.yaml");

        await writeFile(specFile, MINIMAL_OPENAPI);
        await writeFile(overrideFile, 'info:\n  description: "Added by override"\n');

        const outputDir = path.join(tmpDir.path, "output");
        await mkdir(outputDir, { recursive: true });

        const manifest = await collectRawSpecs({
            specs: [
                {
                    type: "openapi",
                    absoluteFilepath: AbsoluteFilePath.of(specFile),
                    absoluteFilepathToOverrides: AbsoluteFilePath.of(overrideFile),
                    absoluteFilepathToOverlays: undefined,
                    source: {
                        type: "openapi",
                        file: AbsoluteFilePath.of(specFile),
                        relativePathToDependency: undefined
                    }
                }
            ],
            hostOutputDir: AbsoluteFilePath.of(outputDir),
            containerBaseDir: "/fern/specs",
            context: createMockContext()
        });

        expect(manifest.specs).toHaveLength(1);
        expect(manifest.specs[0]?.overridePaths).toBeUndefined();

        const content = await readFile(path.join(outputDir, "openapi0.json"), "utf-8");
        const parsed = JSON.parse(content);
        expect(parsed.info.description).toBe("Added by override");
        expect(parsed.info.title).toBe("Test");
    });

    it("bundles external refs into a single self-contained JSON", async () => {
        const specFile = path.join(sourceDir, "api", "openapi.yaml");
        const sharedDir = path.join(sourceDir, "shared");
        const sharedModel = path.join(sharedDir, "models.yaml");

        await mkdir(sharedDir, { recursive: true });
        await writeFile(
            specFile,
            [
                'openapi: "3.0.0"',
                "info:",
                "  title: Test",
                '  version: "1.0"',
                "paths:",
                "  /users:",
                "    get:",
                "      operationId: getUsers",
                "      responses:",
                '        "200":',
                "          description: OK",
                "          content:",
                "            application/json:",
                "              schema:",
                '                $ref: "../shared/models.yaml#/User"'
            ].join("\n")
        );
        await writeFile(
            sharedModel,
            ["User:", "  type: object", "  properties:", "    name:", "      type: string"].join("\n")
        );

        const outputDir = path.join(tmpDir.path, "output");
        await mkdir(outputDir, { recursive: true });

        const manifest = await collectRawSpecs({
            specs: [
                {
                    type: "openapi",
                    absoluteFilepath: AbsoluteFilePath.of(specFile),
                    absoluteFilepathToOverrides: undefined,
                    absoluteFilepathToOverlays: undefined,
                    source: {
                        type: "openapi",
                        file: AbsoluteFilePath.of(specFile),
                        relativePathToDependency: undefined
                    }
                }
            ],
            hostOutputDir: AbsoluteFilePath.of(outputDir),
            containerBaseDir: "/fern/specs",
            context: createMockContext()
        });

        expect(manifest.specs).toHaveLength(1);

        const content = await readFile(path.join(outputDir, "openapi0.json"), "utf-8");
        const parsed = JSON.parse(content);
        // External $ref should be resolved/inlined
        expect(JSON.stringify(parsed)).toContain("name");
    });

    it("handles multiple OpenAPI specs with indexed filenames", async () => {
        const spec1 = path.join(sourceDir, "api", "v1.yaml");
        const spec2 = path.join(sourceDir, "api", "v2.yaml");

        await writeFile(spec1, 'openapi: "3.0.0"\ninfo:\n  title: V1\n  version: "1.0"\npaths: {}');
        await writeFile(spec2, 'openapi: "3.0.0"\ninfo:\n  title: V2\n  version: "2.0"\npaths: {}');

        const outputDir = path.join(tmpDir.path, "output");
        await mkdir(outputDir, { recursive: true });

        const manifest = await collectRawSpecs({
            specs: [
                {
                    type: "openapi",
                    absoluteFilepath: AbsoluteFilePath.of(spec1),
                    absoluteFilepathToOverrides: undefined,
                    absoluteFilepathToOverlays: undefined,
                    source: { type: "openapi", file: AbsoluteFilePath.of(spec1), relativePathToDependency: undefined }
                },
                {
                    type: "openapi",
                    absoluteFilepath: AbsoluteFilePath.of(spec2),
                    absoluteFilepathToOverrides: undefined,
                    absoluteFilepathToOverlays: undefined,
                    source: { type: "openapi", file: AbsoluteFilePath.of(spec2), relativePathToDependency: undefined }
                }
            ],
            hostOutputDir: AbsoluteFilePath.of(outputDir),
            containerBaseDir: "/fern/specs",
            context: createMockContext()
        });

        expect(manifest.specs).toHaveLength(2);
        expect(manifest.specs[0]?.specPath).toBe("/fern/specs/openapi0.json");
        expect(manifest.specs[1]?.specPath).toBe("/fern/specs/openapi1.json");

        const content0 = JSON.parse(await readFile(path.join(outputDir, "openapi0.json"), "utf-8"));
        const content1 = JSON.parse(await readFile(path.join(outputDir, "openapi1.json"), "utf-8"));
        expect(content0.info.title).toBe("V1");
        expect(content1.info.title).toBe("V2");
    });

    it("copies protobuf directory as-is", async () => {
        const protoRoot = path.join(sourceDir, "proto");
        await writeFile(path.join(protoRoot, "service", "api.proto"), 'syntax = "proto3";');

        const outputDir = path.join(tmpDir.path, "output");
        await mkdir(outputDir, { recursive: true });

        const manifest = await collectRawSpecs({
            specs: [
                {
                    type: "protobuf",
                    absoluteFilepathToProtobufRoot: AbsoluteFilePath.of(protoRoot),
                    absoluteFilepathToProtobufTarget: undefined,
                    absoluteFilepathToOverrides: undefined,
                    relativeFilepathToProtobufRoot: RelativeFilePath.of("proto"),
                    generateLocally: false,
                    fromOpenAPI: false,
                    dependencies: []
                }
            ],
            hostOutputDir: AbsoluteFilePath.of(outputDir),
            containerBaseDir: "/fern/specs",
            context: createMockContext()
        });

        expect(manifest.specs).toHaveLength(1);
        expect(manifest.specs[0]?.type).toBe("protobuf");
        expect(manifest.specs[0]?.specPath).toBe("/fern/specs/protobuf0");

        const copiedProto = await readFile(path.join(outputDir, "protobuf0", "service", "api.proto"), "utf-8");
        expect(copiedProto).toBe('syntax = "proto3";');
    });

    it("copies protobuf directory with override files", async () => {
        const protoRoot = path.join(sourceDir, "proto");
        const overrideFile = path.join(sourceDir, "overrides", "override.yaml");

        await writeFile(path.join(protoRoot, "service", "api.proto"), 'syntax = "proto3";');
        await writeFile(overrideFile, "override: true");

        const outputDir = path.join(tmpDir.path, "output");
        await mkdir(outputDir, { recursive: true });

        const manifest = await collectRawSpecs({
            specs: [
                {
                    type: "protobuf",
                    absoluteFilepathToProtobufRoot: AbsoluteFilePath.of(protoRoot),
                    absoluteFilepathToProtobufTarget: undefined,
                    absoluteFilepathToOverrides: AbsoluteFilePath.of(overrideFile),
                    relativeFilepathToProtobufRoot: RelativeFilePath.of("proto"),
                    generateLocally: false,
                    fromOpenAPI: false,
                    dependencies: []
                }
            ],
            hostOutputDir: AbsoluteFilePath.of(outputDir),
            containerBaseDir: "/fern/specs",
            context: createMockContext()
        });

        expect(manifest.specs[0]?.overridePaths).toEqual(["/fern/specs/protobuf0-override-0.yaml"]);
    });

    it("copies GraphQL spec as-is", async () => {
        const graphqlFile = path.join(sourceDir, "api", "schema.graphql");
        await writeFile(graphqlFile, "type Query { hello: String }");

        const outputDir = path.join(tmpDir.path, "output");
        await mkdir(outputDir, { recursive: true });

        const manifest = await collectRawSpecs({
            specs: [
                {
                    type: "graphql",
                    absoluteFilepath: AbsoluteFilePath.of(graphqlFile),
                    absoluteFilepathToOverrides: undefined,
                    absoluteFilepathToExamples: undefined
                }
            ],
            hostOutputDir: AbsoluteFilePath.of(outputDir),
            containerBaseDir: "/fern/specs",
            context: createMockContext()
        });

        expect(manifest.specs).toHaveLength(1);
        expect(manifest.specs[0]?.type).toBe("graphql");
        expect(manifest.specs[0]?.specPath).toBe("/fern/specs/graphql0.graphql");

        const content = await readFile(path.join(outputDir, "graphql0.graphql"), "utf-8");
        expect(content).toBe("type Query { hello: String }");
    });

    it("resolves OpenRPC spec with overrides to compact JSON", async () => {
        const specFile = path.join(sourceDir, "api", "openrpc.json");
        const overrideFile = path.join(sourceDir, "overrides", "override.json");

        await writeFile(specFile, JSON.stringify({ openrpc: "1.0.0", info: { title: "Test", version: "1.0" } }));
        await writeFile(overrideFile, JSON.stringify({ info: { description: "Added by override" } }));

        const outputDir = path.join(tmpDir.path, "output");
        await mkdir(outputDir, { recursive: true });

        const manifest = await collectRawSpecs({
            specs: [
                {
                    type: "openrpc",
                    absoluteFilepath: AbsoluteFilePath.of(specFile),
                    absoluteFilepathToOverrides: AbsoluteFilePath.of(overrideFile)
                }
            ],
            hostOutputDir: AbsoluteFilePath.of(outputDir),
            containerBaseDir: "/fern/specs",
            context: createMockContext()
        });

        expect(manifest.specs).toHaveLength(1);
        expect(manifest.specs[0]?.type).toBe("openrpc");
        expect(manifest.specs[0]?.overridePaths).toBeUndefined();

        const content = await readFile(path.join(outputDir, "openrpc0.json"), "utf-8");
        const parsed = JSON.parse(content);
        expect(parsed.openrpc).toBe("1.0.0");
        expect(parsed.info.description).toBe("Added by override");
    });

    it("handles mixed spec types (OpenAPI + protobuf + GraphQL)", async () => {
        const specFile = path.join(sourceDir, "api", "openapi.yaml");
        const protoRoot = path.join(sourceDir, "proto");
        const graphqlFile = path.join(sourceDir, "api", "schema.graphql");

        await writeFile(specFile, MINIMAL_OPENAPI);
        await writeFile(path.join(protoRoot, "service", "api.proto"), 'syntax = "proto3";');
        await writeFile(graphqlFile, "type Query { hello: String }");

        const outputDir = path.join(tmpDir.path, "output");
        await mkdir(outputDir, { recursive: true });

        const manifest = await collectRawSpecs({
            specs: [
                {
                    type: "openapi",
                    absoluteFilepath: AbsoluteFilePath.of(specFile),
                    absoluteFilepathToOverrides: undefined,
                    absoluteFilepathToOverlays: undefined,
                    source: {
                        type: "openapi",
                        file: AbsoluteFilePath.of(specFile),
                        relativePathToDependency: undefined
                    }
                },
                {
                    type: "protobuf",
                    absoluteFilepathToProtobufRoot: AbsoluteFilePath.of(protoRoot),
                    absoluteFilepathToProtobufTarget: undefined,
                    absoluteFilepathToOverrides: undefined,
                    relativeFilepathToProtobufRoot: RelativeFilePath.of("proto"),
                    generateLocally: false,
                    fromOpenAPI: false,
                    dependencies: []
                },
                {
                    type: "graphql",
                    absoluteFilepath: AbsoluteFilePath.of(graphqlFile),
                    absoluteFilepathToOverrides: undefined,
                    absoluteFilepathToExamples: undefined
                }
            ],
            hostOutputDir: AbsoluteFilePath.of(outputDir),
            containerBaseDir: "/fern/specs",
            context: createMockContext()
        });

        expect(manifest.specs).toHaveLength(3);
        expect(manifest.specs[0]?.type).toBe("openapi");
        expect(manifest.specs[0]?.specPath).toBe("/fern/specs/openapi0.json");
        expect(manifest.specs[1]?.type).toBe("protobuf");
        expect(manifest.specs[1]?.specPath).toBe("/fern/specs/protobuf0");
        expect(manifest.specs[2]?.type).toBe("graphql");
        expect(manifest.specs[2]?.specPath).toBe("/fern/specs/graphql0.graphql");
    });

    it("uses container paths in manifest entries", async () => {
        const specFile = path.join(sourceDir, "api", "openapi.yaml");
        await writeFile(specFile, MINIMAL_OPENAPI);

        const outputDir = path.join(tmpDir.path, "output");
        await mkdir(outputDir, { recursive: true });

        const manifest = await collectRawSpecs({
            specs: [
                {
                    type: "openapi",
                    absoluteFilepath: AbsoluteFilePath.of(specFile),
                    absoluteFilepathToOverrides: undefined,
                    absoluteFilepathToOverlays: undefined,
                    source: {
                        type: "openapi",
                        file: AbsoluteFilePath.of(specFile),
                        relativePathToDependency: undefined
                    }
                }
            ],
            hostOutputDir: AbsoluteFilePath.of(outputDir),
            containerBaseDir: "/fern/specs",
            context: createMockContext()
        });

        expect(manifest.specs[0]?.specPath).toMatch(/^\/fern\/specs\//);
    });

    it("merges array overrides sequentially into OpenAPI spec", async () => {
        const specFile = path.join(sourceDir, "api", "openapi.yaml");
        const override1 = path.join(sourceDir, "overrides", "override1.yaml");
        const override2 = path.join(sourceDir, "overrides", "override2.yaml");

        await writeFile(specFile, MINIMAL_OPENAPI);
        await writeFile(override1, 'info:\n  description: "From override 1"');
        await writeFile(override2, 'info:\n  x-custom: "From override 2"');

        const outputDir = path.join(tmpDir.path, "output");
        await mkdir(outputDir, { recursive: true });

        const manifest = await collectRawSpecs({
            specs: [
                {
                    type: "openapi",
                    absoluteFilepath: AbsoluteFilePath.of(specFile),
                    absoluteFilepathToOverrides: [AbsoluteFilePath.of(override1), AbsoluteFilePath.of(override2)],
                    absoluteFilepathToOverlays: undefined,
                    source: {
                        type: "openapi",
                        file: AbsoluteFilePath.of(specFile),
                        relativePathToDependency: undefined
                    }
                }
            ],
            hostOutputDir: AbsoluteFilePath.of(outputDir),
            containerBaseDir: "/fern/specs",
            context: createMockContext()
        });

        expect(manifest.specs[0]?.overridePaths).toBeUndefined();

        const content = await readFile(path.join(outputDir, "openapi0.json"), "utf-8");
        const parsed = JSON.parse(content);
        expect(parsed.info.description).toBe("From override 1");
        expect(parsed.info["x-custom"]).toBe("From override 2");
    });

    it("does not copy raw files - only outputs resolved JSON", async () => {
        const specFile = path.join(sourceDir, "api", "openapi.yaml");
        await writeFile(specFile, MINIMAL_OPENAPI);

        const outputDir = path.join(tmpDir.path, "output");
        await mkdir(outputDir, { recursive: true });

        await collectRawSpecs({
            specs: [
                {
                    type: "openapi",
                    absoluteFilepath: AbsoluteFilePath.of(specFile),
                    absoluteFilepathToOverrides: undefined,
                    absoluteFilepathToOverlays: undefined,
                    source: {
                        type: "openapi",
                        file: AbsoluteFilePath.of(specFile),
                        relativePathToDependency: undefined
                    }
                }
            ],
            hostOutputDir: AbsoluteFilePath.of(outputDir),
            containerBaseDir: "/fern/specs",
            context: createMockContext()
        });

        const resolvedContent = await readFile(path.join(outputDir, "openapi0.json"), "utf-8");
        expect(resolvedContent).toBeTruthy();

        await expect(readFile(path.join(outputDir, "openapi.yaml"), "utf-8")).rejects.toThrow();
        await expect(readFile(path.join(outputDir, "api", "openapi.yaml"), "utf-8")).rejects.toThrow();
    });

    it("GraphQL spec with overrides keeps overrides as separate files", async () => {
        const graphqlFile = path.join(sourceDir, "api", "schema.graphql");
        const overrideFile = path.join(sourceDir, "overrides", "override.yaml");

        await writeFile(graphqlFile, "type Query { hello: String }");
        await writeFile(overrideFile, "override: true");

        const outputDir = path.join(tmpDir.path, "output");
        await mkdir(outputDir, { recursive: true });

        const manifest = await collectRawSpecs({
            specs: [
                {
                    type: "graphql",
                    absoluteFilepath: AbsoluteFilePath.of(graphqlFile),
                    absoluteFilepathToOverrides: AbsoluteFilePath.of(overrideFile),
                    absoluteFilepathToExamples: undefined
                }
            ],
            hostOutputDir: AbsoluteFilePath.of(outputDir),
            containerBaseDir: "/fern/specs",
            context: createMockContext()
        });

        expect(manifest.specs[0]?.overridePaths).toEqual(["/fern/specs/graphql0-override-0.yaml"]);
    });

    it("filters out x-fern-ignore operations from resolved OpenAPI spec", async () => {
        const specFile = path.join(sourceDir, "api", "openapi.yaml");
        await writeFile(
            specFile,
            [
                'openapi: "3.0.0"',
                "info:",
                "  title: Test",
                '  version: "1.0"',
                "paths:",
                "  /users:",
                "    get:",
                "      operationId: getUsers",
                "      responses:",
                '        "200":',
                "          description: OK",
                "    post:",
                "      operationId: createUser",
                "      x-fern-ignore: true",
                "      responses:",
                '        "200":',
                "          description: OK",
                "  /internal:",
                "    get:",
                "      operationId: internalEndpoint",
                "      x-fern-ignore: true",
                "      responses:",
                '        "200":',
                "          description: OK"
            ].join("\n")
        );

        const outputDir = path.join(tmpDir.path, "output");
        await mkdir(outputDir, { recursive: true });

        const manifest = await collectRawSpecs({
            specs: [
                {
                    type: "openapi",
                    absoluteFilepath: AbsoluteFilePath.of(specFile),
                    absoluteFilepathToOverrides: undefined,
                    absoluteFilepathToOverlays: undefined,
                    source: {
                        type: "openapi",
                        file: AbsoluteFilePath.of(specFile),
                        relativePathToDependency: undefined
                    }
                }
            ],
            hostOutputDir: AbsoluteFilePath.of(outputDir),
            containerBaseDir: "/fern/specs",
            context: createMockContext()
        });

        const content = JSON.parse(await readFile(path.join(outputDir, "openapi0.json"), "utf-8"));
        expect(content.paths["/users"]).toBeDefined();
        expect(content.paths["/users"].get).toBeDefined();
        expect(content.paths["/users"].post).toBeUndefined();
        expect(content.paths["/internal"]).toBeUndefined();

        expect(manifest.specs).toHaveLength(1);
    });

    it("filters operations by x-fern-audiences when audiences are configured", async () => {
        const specFile = path.join(sourceDir, "api", "openapi.yaml");
        await writeFile(
            specFile,
            [
                'openapi: "3.0.0"',
                "info:",
                "  title: Test",
                '  version: "1.0"',
                "paths:",
                "  /public:",
                "    get:",
                "      operationId: publicEndpoint",
                "      x-fern-audiences:",
                "        - external",
                "      responses:",
                '        "200":',
                "          description: OK",
                "  /internal:",
                "    get:",
                "      operationId: internalEndpoint",
                "      x-fern-audiences:",
                "        - internal",
                "      responses:",
                '        "200":',
                "          description: OK",
                "  /untagged:",
                "    get:",
                "      operationId: untaggedEndpoint",
                "      responses:",
                '        "200":',
                "          description: OK"
            ].join("\n")
        );

        const outputDir = path.join(tmpDir.path, "output");
        await mkdir(outputDir, { recursive: true });

        const manifest = await collectRawSpecs({
            specs: [
                {
                    type: "openapi",
                    absoluteFilepath: AbsoluteFilePath.of(specFile),
                    absoluteFilepathToOverrides: undefined,
                    absoluteFilepathToOverlays: undefined,
                    source: {
                        type: "openapi",
                        file: AbsoluteFilePath.of(specFile),
                        relativePathToDependency: undefined
                    }
                }
            ],
            hostOutputDir: AbsoluteFilePath.of(outputDir),
            containerBaseDir: "/fern/specs",
            audiences: { type: "select", audiences: ["external"] },
            context: createMockContext()
        });

        const content = JSON.parse(await readFile(path.join(outputDir, "openapi0.json"), "utf-8"));
        expect(content.paths["/public"]).toBeDefined();
        expect(content.paths["/public"].get).toBeDefined();
        expect(content.paths["/internal"]).toBeUndefined();
        expect(content.paths["/untagged"]).toBeDefined();
        expect(content.paths["/untagged"].get).toBeDefined();

        expect(manifest.specs).toHaveLength(1);
    });

    it("keeps all operations when audiences type is 'all'", async () => {
        const specFile = path.join(sourceDir, "api", "openapi.yaml");
        await writeFile(
            specFile,
            [
                'openapi: "3.0.0"',
                "info:",
                "  title: Test",
                '  version: "1.0"',
                "paths:",
                "  /public:",
                "    get:",
                "      operationId: publicEndpoint",
                "      x-fern-audiences:",
                "        - external",
                "      responses:",
                '        "200":',
                "          description: OK",
                "  /internal:",
                "    get:",
                "      operationId: internalEndpoint",
                "      x-fern-audiences:",
                "        - internal",
                "      responses:",
                '        "200":',
                "          description: OK"
            ].join("\n")
        );

        const outputDir = path.join(tmpDir.path, "output");
        await mkdir(outputDir, { recursive: true });

        const manifest = await collectRawSpecs({
            specs: [
                {
                    type: "openapi",
                    absoluteFilepath: AbsoluteFilePath.of(specFile),
                    absoluteFilepathToOverrides: undefined,
                    absoluteFilepathToOverlays: undefined,
                    source: {
                        type: "openapi",
                        file: AbsoluteFilePath.of(specFile),
                        relativePathToDependency: undefined
                    }
                }
            ],
            hostOutputDir: AbsoluteFilePath.of(outputDir),
            containerBaseDir: "/fern/specs",
            audiences: { type: "all" },
            context: createMockContext()
        });

        const content = JSON.parse(await readFile(path.join(outputDir, "openapi0.json"), "utf-8"));
        expect(content.paths["/public"]).toBeDefined();
        expect(content.paths["/internal"]).toBeDefined();
    });
});

describe("filterSpec", () => {
    it("returns spec unchanged when no audiences and no ignored operations", () => {
        const spec = {
            openapi: "3.0.0",
            paths: {
                "/users": {
                    get: { operationId: "getUsers" },
                    post: { operationId: "createUser" }
                }
            }
        };
        const result = filterSpec(spec);
        expect(result.paths).toEqual(spec.paths);
    });

    it("removes operations with x-fern-ignore: true", () => {
        const spec = {
            openapi: "3.0.0",
            paths: {
                "/users": {
                    get: { operationId: "getUsers" },
                    post: { operationId: "createUser", "x-fern-ignore": true }
                },
                "/admin": {
                    get: { operationId: "adminGet", "x-fern-ignore": true }
                }
            }
        };
        const result = filterSpec(spec);
        const paths = result.paths as Record<string, Record<string, unknown>> | undefined;
        expect(paths?.["/users"]?.get).toBeDefined();
        expect(paths?.["/users"]?.post).toBeUndefined();
        expect(paths?.["/admin"]).toBeUndefined();
    });

    it("filters by audiences when SelectAudiences is provided", () => {
        const spec = {
            openapi: "3.0.0",
            paths: {
                "/public": {
                    get: { operationId: "publicGet", "x-fern-audiences": ["external"] }
                },
                "/internal": {
                    get: { operationId: "internalGet", "x-fern-audiences": ["internal"] }
                },
                "/both": {
                    get: { operationId: "bothGet", "x-fern-audiences": ["external", "internal"] }
                },
                "/untagged": {
                    get: { operationId: "untaggedGet" }
                }
            }
        };
        const result = filterSpec(spec, { type: "select", audiences: ["external"] });
        const paths = result.paths as Record<string, Record<string, unknown>> | undefined;
        expect(paths?.["/public"]).toBeDefined();
        expect(paths?.["/internal"]).toBeUndefined();
        expect(paths?.["/both"]).toBeDefined();
        expect(paths?.["/untagged"]).toBeDefined();
    });

    it("combines x-fern-ignore and audience filtering", () => {
        const spec = {
            openapi: "3.0.0",
            paths: {
                "/endpoint": {
                    get: { operationId: "kept", "x-fern-audiences": ["external"] },
                    post: { operationId: "ignored", "x-fern-ignore": true, "x-fern-audiences": ["external"] },
                    put: { operationId: "wrongAudience", "x-fern-audiences": ["internal"] },
                    delete: { operationId: "noAudience" }
                }
            }
        };
        const result = filterSpec(spec, { type: "select", audiences: ["external"] });
        const paths = result.paths as Record<string, Record<string, unknown>> | undefined;
        expect(paths?.["/endpoint"]?.get).toBeDefined();
        expect(paths?.["/endpoint"]?.post).toBeUndefined();
        expect(paths?.["/endpoint"]?.put).toBeUndefined();
        expect(paths?.["/endpoint"]?.delete).toBeDefined();
    });

    it("preserves non-operation path-level properties", () => {
        const spec = {
            openapi: "3.0.0",
            paths: {
                "/users": {
                    parameters: [{ name: "id", in: "path" }],
                    get: { operationId: "getUsers" },
                    post: { operationId: "createUser", "x-fern-ignore": true }
                }
            }
        };
        const result = filterSpec(spec);
        const paths = result.paths as Record<string, Record<string, unknown>> | undefined;
        expect(paths?.["/users"]?.parameters).toBeDefined();
        expect(paths?.["/users"]?.get).toBeDefined();
        expect(paths?.["/users"]?.post).toBeUndefined();
    });

    it("returns spec unchanged when paths is missing", () => {
        const spec = { openapi: "3.0.0", info: { title: "Test" } };
        const result = filterSpec(spec);
        expect(result).toEqual(spec);
    });

    it("handles empty paths object", () => {
        const spec = { openapi: "3.0.0", paths: {} };
        const result = filterSpec(spec);
        expect(result.paths).toEqual({});
    });

    it("handles x-fern-audiences as single string value", () => {
        const spec = {
            openapi: "3.0.0",
            paths: {
                "/endpoint": {
                    get: { operationId: "getEndpoint", "x-fern-audiences": "external" }
                }
            }
        };
        const result = filterSpec(spec, { type: "select", audiences: ["external"] });
        const paths = result.paths as Record<string, Record<string, unknown>> | undefined;
        expect(paths?.["/endpoint"]?.get).toBeDefined();

        const result2 = filterSpec(spec, { type: "select", audiences: ["internal"] });
        const paths2 = result2.paths as Record<string, Record<string, unknown>> | undefined;
        expect(paths2?.["/endpoint"]).toBeUndefined();
    });
});

/**
 * Coverage for the per-entry `namespace` field added to
 * `RawSpecsManifestEntry`. Downstream generators (initially
 * `fernapi/fern-cli-generator`) rely on this field to route multi-spec
 * workspaces by their `generators.yml`-declared namespace rather than
 * inferring one from the runner-assigned filename.
 */
describe("collectRawSpecs (namespace propagation)", () => {
    let tmpDir: tmp.DirectoryResult;
    let sourceDir: string;

    beforeEach(async () => {
        tmpDir = await tmp.dir({ unsafeCleanup: true });
        sourceDir = path.join(tmpDir.path, "source");
        await mkdir(path.join(sourceDir, "api"), { recursive: true });
    });

    afterEach(async () => {
        await rm(tmpDir.path, { recursive: true, force: true });
    });

    it("propagates an OpenAPI spec's namespace into the manifest entry", async () => {
        const specFile = path.join(sourceDir, "api", "openapi.yaml");
        await writeFile(specFile, MINIMAL_OPENAPI);

        const outputDir = path.join(tmpDir.path, "output");
        await mkdir(outputDir, { recursive: true });

        const manifest = await collectRawSpecs({
            specs: [
                {
                    type: "openapi",
                    absoluteFilepath: AbsoluteFilePath.of(specFile),
                    absoluteFilepathToOverrides: undefined,
                    absoluteFilepathToOverlays: undefined,
                    namespace: "v2",
                    source: {
                        type: "openapi",
                        file: AbsoluteFilePath.of(specFile),
                        relativePathToDependency: undefined
                    }
                }
            ],
            hostOutputDir: AbsoluteFilePath.of(outputDir),
            containerBaseDir: "/fern/specs",
            context: createMockContext()
        });

        expect(manifest.specs).toHaveLength(1);
        expect(manifest.specs[0]?.namespace).toBe("v2");
    });

    it("leaves namespace undefined when the spec was declared at the workspace root", async () => {
        const specFile = path.join(sourceDir, "api", "openapi.yaml");
        await writeFile(specFile, MINIMAL_OPENAPI);

        const outputDir = path.join(tmpDir.path, "output");
        await mkdir(outputDir, { recursive: true });

        const manifest = await collectRawSpecs({
            specs: [
                {
                    type: "openapi",
                    absoluteFilepath: AbsoluteFilePath.of(specFile),
                    absoluteFilepathToOverrides: undefined,
                    absoluteFilepathToOverlays: undefined,
                    source: {
                        type: "openapi",
                        file: AbsoluteFilePath.of(specFile),
                        relativePathToDependency: undefined
                    }
                }
            ],
            hostOutputDir: AbsoluteFilePath.of(outputDir),
            containerBaseDir: "/fern/specs",
            context: createMockContext()
        });

        expect(manifest.specs).toHaveLength(1);
        expect(manifest.specs[0]?.namespace).toBeUndefined();
    });

    it("keeps each spec's namespace independent in a multi-spec workspace", async () => {
        const usersFile = path.join(sourceDir, "api", "users.yaml");
        const billingFile = path.join(sourceDir, "api", "billing.yaml");
        await writeFile(usersFile, MINIMAL_OPENAPI);
        await writeFile(billingFile, MINIMAL_OPENAPI);

        const outputDir = path.join(tmpDir.path, "output");
        await mkdir(outputDir, { recursive: true });

        const manifest = await collectRawSpecs({
            specs: [
                {
                    type: "openapi",
                    absoluteFilepath: AbsoluteFilePath.of(usersFile),
                    absoluteFilepathToOverrides: undefined,
                    absoluteFilepathToOverlays: undefined,
                    namespace: "users",
                    source: {
                        type: "openapi",
                        file: AbsoluteFilePath.of(usersFile),
                        relativePathToDependency: undefined
                    }
                },
                {
                    type: "openapi",
                    absoluteFilepath: AbsoluteFilePath.of(billingFile),
                    absoluteFilepathToOverrides: undefined,
                    absoluteFilepathToOverlays: undefined,
                    // No namespace on this entry — mixed workspaces are valid.
                    source: {
                        type: "openapi",
                        file: AbsoluteFilePath.of(billingFile),
                        relativePathToDependency: undefined
                    }
                }
            ],
            hostOutputDir: AbsoluteFilePath.of(outputDir),
            containerBaseDir: "/fern/specs",
            context: createMockContext()
        });

        expect(manifest.specs).toHaveLength(2);
        expect(manifest.specs[0]?.namespace).toBe("users");
        expect(manifest.specs[1]?.namespace).toBeUndefined();
    });
});
