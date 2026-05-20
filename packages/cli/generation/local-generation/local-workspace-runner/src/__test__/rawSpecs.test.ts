import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { collectRawSpecs, filterSpec } from "../rawSpecs.js";

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
                    }
                }
            ],
            hostOutputDir: AbsoluteFilePath.of(outputDir),
            containerBaseDir: "/fern/specs",
            context: createMockContext()
        });

        expect(manifest.specs).toHaveLength(1);
        expect(manifest.specs[0]?.type).toBe("openapi");
        expect(manifest.specs[0]?.specPath).toBe("/fern/specs/spec-0.json");
        expect(manifest.specs[0]?.overridePaths).toBeUndefined();

        const content = await readFile(path.join(outputDir, "spec-0.json"), "utf-8");
        const parsed = JSON.parse(content);
        expect(parsed.openapi).toBe("3.0.0");
        expect(parsed.info.title).toBe("Test");
        // Compact JSON has no newlines
        expect(content).not.toContain("\n");
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

        const content = await readFile(path.join(outputDir, "spec-0.json"), "utf-8");
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

        const content = await readFile(path.join(outputDir, "spec-0.json"), "utf-8");
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
        expect(manifest.specs[0]?.specPath).toBe("/fern/specs/spec-0.json");
        expect(manifest.specs[1]?.specPath).toBe("/fern/specs/spec-1.json");

        const content0 = JSON.parse(await readFile(path.join(outputDir, "spec-0.json"), "utf-8"));
        const content1 = JSON.parse(await readFile(path.join(outputDir, "spec-1.json"), "utf-8"));
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
        expect(manifest.specs[0]?.specPath).toBe("/fern/specs/proto-0");

        const copiedProto = await readFile(path.join(outputDir, "proto-0", "service", "api.proto"), "utf-8");
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

        expect(manifest.specs[0]?.overridePaths).toHaveLength(1);
        expect(manifest.specs[0]?.overridePaths?.[0]).toContain("proto-0-override-0");
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
        expect(manifest.specs[0]?.specPath).toBe("/fern/specs/spec-0.graphql");

        const content = await readFile(path.join(outputDir, "spec-0.graphql"), "utf-8");
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

        const content = await readFile(path.join(outputDir, "spec-0.json"), "utf-8");
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
        expect(manifest.specs[0]?.specPath).toBe("/fern/specs/spec-0.json");
        expect(manifest.specs[1]?.type).toBe("protobuf");
        expect(manifest.specs[1]?.specPath).toBe("/fern/specs/proto-1");
        expect(manifest.specs[2]?.type).toBe("graphql");
        expect(manifest.specs[2]?.specPath).toBe("/fern/specs/spec-2.graphql");
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

        const content = await readFile(path.join(outputDir, "spec-0.json"), "utf-8");
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

        const resolvedContent = await readFile(path.join(outputDir, "spec-0.json"), "utf-8");
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

        expect(manifest.specs[0]?.overridePaths).toHaveLength(1);
        expect(manifest.specs[0]?.overridePaths?.[0]).toContain("graphql-0-override-0");
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

        const content = JSON.parse(await readFile(path.join(outputDir, "spec-0.json"), "utf-8"));
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

        const content = JSON.parse(await readFile(path.join(outputDir, "spec-0.json"), "utf-8"));
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

        const content = JSON.parse(await readFile(path.join(outputDir, "spec-0.json"), "utf-8"));
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
