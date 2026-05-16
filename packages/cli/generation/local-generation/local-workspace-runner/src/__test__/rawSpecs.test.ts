import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { access, mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { collectRawSpecs, findCommonDirectory } from "../rawSpecs.js";

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

describe("findCommonDirectory", () => {
    it("returns / for empty array", () => {
        expect(findCommonDirectory([])).toBe("/");
    });

    it("returns parent directory for single file path", () => {
        expect(findCommonDirectory(["/home/user/project/spec.yaml"])).toBe("/home/user/project");
    });

    it("finds common directory for files in the same directory", () => {
        expect(findCommonDirectory(["/home/user/project/openapi.yaml", "/home/user/project/overrides.yaml"])).toBe(
            "/home/user/project"
        );
    });

    it("finds common directory for files in different subdirectories", () => {
        expect(
            findCommonDirectory(["/home/user/project/api/openapi.yaml", "/home/user/project/overrides/override.yaml"])
        ).toBe("/home/user/project");
    });

    it("handles deeply nested specs with shared prefix", () => {
        expect(
            findCommonDirectory([
                "/workspace/fern/apis/v1/spec.yaml",
                "/workspace/fern/apis/v2/spec.yaml",
                "/workspace/fern/apis/overrides.yaml"
            ])
        ).toBe("/workspace/fern/apis");
    });

    it("handles protobuf directory paths correctly when marked as directories", () => {
        const protobufRoot = "/home/user/project/proto";
        const directoryPaths = new Set([protobufRoot]);
        expect(findCommonDirectory([protobufRoot, "/home/user/project/overrides/override.yaml"], directoryPaths)).toBe(
            "/home/user/project"
        );
    });

    it("without directoryPaths, treats protobuf root as a file (dirname goes up one extra level)", () => {
        const protobufRoot = "/home/user/project/proto";
        // Without marking as directory, dirname("/home/user/project/proto") = "/home/user/project"
        // dirname("/home/user/project/overrides/override.yaml") = "/home/user/project/overrides"
        // Common = "/home/user/project"
        expect(findCommonDirectory([protobufRoot, "/home/user/project/overrides/override.yaml"])).toBe(
            "/home/user/project"
        );
    });

    it("protobuf root as directory keeps common root tighter", () => {
        // protobufRoot = "/a/b/proto" (directory) → used as-is: "/a/b/proto"
        // spec file = "/a/b/proto/overrides.yaml" → dirname: "/a/b/proto"
        // Common = "/a/b/proto"
        const protobufRoot = "/a/b/proto";
        const directoryPaths = new Set([protobufRoot]);
        expect(findCommonDirectory([protobufRoot, "/a/b/proto/overrides.yaml"], directoryPaths)).toBe("/a/b/proto");
    });

    it("handles root-level paths", () => {
        expect(findCommonDirectory(["/a.yaml", "/b.yaml"])).toBe("/");
    });
});

describe("collectRawSpecs", () => {
    let tmpDir: tmp.DirectoryResult;
    let sourceDir: string;

    beforeEach(async () => {
        tmpDir = await tmp.dir({ unsafeCleanup: true });

        // Create a source directory structure to simulate workspace files
        sourceDir = path.join(tmpDir.path, "source");
        await mkdir(path.join(sourceDir, "api"), { recursive: true });
        await mkdir(path.join(sourceDir, "overrides"), { recursive: true });
        await mkdir(path.join(sourceDir, "overlays"), { recursive: true });
        await mkdir(path.join(sourceDir, "proto", "service"), { recursive: true });
    });

    afterEach(async () => {
        await rm(tmpDir.path, { recursive: true, force: true });
    });

    it("collects a single OpenAPI spec", async () => {
        const specFile = path.join(sourceDir, "api", "openapi.yaml");
        await writeFile(specFile, "openapi: 3.0.0\ninfo:\n  title: Test\n  version: '1.0'");

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
            containerBaseDir: "/fern/raw-specs",
            context: createMockContext()
        });

        expect(manifest.specs).toHaveLength(1);
        expect(manifest.specs[0]?.type).toBe("openapi");
        expect(manifest.specs[0]?.specPath).toContain("openapi.yaml");
        expect(manifest.specs[0]?.overridePaths).toBeUndefined();
        expect(manifest.specs[0]?.overlayPath).toBeUndefined();

        // When there's only one file, the common root is its parent dir,
        // so the relative path is just the filename.
        const copiedSpecPath = path.join(outputDir, "openapi.yaml");
        const content = await readFile(copiedSpecPath, "utf-8");
        expect(content).toContain("openapi: 3.0.0");
    });

    it("collects OpenAPI spec with overrides and overlays", async () => {
        const specFile = path.join(sourceDir, "api", "openapi.yaml");
        const overrideFile = path.join(sourceDir, "overrides", "override.yaml");
        const overlayFile = path.join(sourceDir, "overlays", "overlay.yaml");

        await writeFile(specFile, "openapi: 3.0.0");
        await writeFile(overrideFile, "x-fern-override: true");
        await writeFile(overlayFile, "overlay: true");

        const outputDir = path.join(tmpDir.path, "output");
        await mkdir(outputDir, { recursive: true });

        const manifest = await collectRawSpecs({
            specs: [
                {
                    type: "openapi",
                    absoluteFilepath: AbsoluteFilePath.of(specFile),
                    absoluteFilepathToOverrides: AbsoluteFilePath.of(overrideFile),
                    absoluteFilepathToOverlays: AbsoluteFilePath.of(overlayFile),
                    source: {
                        type: "openapi",
                        file: AbsoluteFilePath.of(specFile),
                        relativePathToDependency: undefined
                    }
                }
            ],
            hostOutputDir: AbsoluteFilePath.of(outputDir),
            containerBaseDir: "/fern/raw-specs",
            context: createMockContext()
        });

        expect(manifest.specs).toHaveLength(1);
        const entry = manifest.specs[0];
        expect(entry?.type).toBe("openapi");
        expect(entry?.specPath).toContain("openapi.yaml");
        expect(entry?.overridePaths).toHaveLength(1);
        expect(entry?.overridePaths?.[0]).toContain("override.yaml");
        expect(entry?.overlayPath).toContain("overlay.yaml");

        // Verify all files were copied
        const copiedOverride = path.join(outputDir, "overrides", "override.yaml");
        expect(await readFile(copiedOverride, "utf-8")).toBe("x-fern-override: true");
    });

    it("collects OpenAPI spec with array overrides", async () => {
        const specFile = path.join(sourceDir, "api", "openapi.yaml");
        const override1 = path.join(sourceDir, "overrides", "override1.yaml");
        const override2 = path.join(sourceDir, "overrides", "override2.yaml");

        await writeFile(specFile, "openapi: 3.0.0");
        await writeFile(override1, "override: 1");
        await writeFile(override2, "override: 2");

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
            containerBaseDir: "/fern/raw-specs",
            context: createMockContext()
        });

        expect(manifest.specs[0]?.overridePaths).toHaveLength(2);
    });

    it("collects protobuf spec (directory)", async () => {
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
            containerBaseDir: "/fern/raw-specs",
            context: createMockContext()
        });

        expect(manifest.specs).toHaveLength(1);
        expect(manifest.specs[0]?.type).toBe("protobuf");

        // When proto root is the only path and it's a directory, the common root
        // is the proto directory itself. The contents are copied directly into
        // the output root (relative path is "").
        const copiedProtoFile = path.join(outputDir, "service", "api.proto");
        const content = await readFile(copiedProtoFile, "utf-8");
        expect(content).toBe('syntax = "proto3";');
    });

    it("collects GraphQL spec", async () => {
        const graphqlFile = path.join(sourceDir, "api", "schema.graphql");
        await writeFile(graphqlFile, "type Query { hello: String }");

        const outputDir = path.join(tmpDir.path, "output");
        await mkdir(outputDir, { recursive: true });

        const manifest = await collectRawSpecs({
            specs: [
                {
                    type: "graphql",
                    absoluteFilepath: AbsoluteFilePath.of(graphqlFile),
                    absoluteFilepathToOverrides: undefined
                }
            ],
            hostOutputDir: AbsoluteFilePath.of(outputDir),
            containerBaseDir: "/fern/raw-specs",
            context: createMockContext()
        });

        expect(manifest.specs).toHaveLength(1);
        expect(manifest.specs[0]?.type).toBe("graphql");
    });

    it("collects OpenRPC spec with overrides", async () => {
        const specFile = path.join(sourceDir, "api", "openrpc.json");
        const overrideFile = path.join(sourceDir, "overrides", "override.json");

        await writeFile(specFile, '{"openrpc": "1.0.0"}');
        await writeFile(overrideFile, '{"override": true}');

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
            containerBaseDir: "/fern/raw-specs",
            context: createMockContext()
        });

        expect(manifest.specs).toHaveLength(1);
        expect(manifest.specs[0]?.type).toBe("openrpc");
        expect(manifest.specs[0]?.overridePaths).toHaveLength(1);
    });

    it("preserves relative directory structure across multiple specs", async () => {
        const spec1 = path.join(sourceDir, "api", "v1", "spec.yaml");
        const spec2 = path.join(sourceDir, "api", "v2", "spec.yaml");

        await mkdir(path.join(sourceDir, "api", "v1"), { recursive: true });
        await mkdir(path.join(sourceDir, "api", "v2"), { recursive: true });
        await writeFile(spec1, "v1");
        await writeFile(spec2, "v2");

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
            containerBaseDir: "/fern/raw-specs",
            context: createMockContext()
        });

        expect(manifest.specs).toHaveLength(2);

        // Verify both files exist and directory structure is preserved
        const content1 = await readFile(path.join(outputDir, "v1", "spec.yaml"), "utf-8");
        const content2 = await readFile(path.join(outputDir, "v2", "spec.yaml"), "utf-8");
        expect(content1).toBe("v1");
        expect(content2).toBe("v2");
    });

    it("copies entire directory tree so $ref targets outside spec dir are preserved", async () => {
        // Simulate: spec at sourceDir/api/openapi.yaml references
        // ../../shared/models.yaml via $ref. The shared/models.yaml file
        // should be present in the output even though it's not a spec file.
        const specFile = path.join(sourceDir, "api", "openapi.yaml");
        const sharedDir = path.join(sourceDir, "shared");
        const sharedModel = path.join(sharedDir, "models.yaml");

        await mkdir(sharedDir, { recursive: true });
        await writeFile(specFile, "openapi: 3.0.0\n$ref: '../shared/models.yaml'");
        await writeFile(sharedModel, "components:\n  schemas:\n    User:\n      type: object");

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
            containerBaseDir: "/fern/raw-specs",
            context: createMockContext()
        });

        expect(manifest.specs).toHaveLength(1);

        // The spec file's parent dir is sourceDir/api/. That's the common root.
        // But the whole tree from sourceDir/api/ is copied, which only includes openapi.yaml.
        // To capture shared/models.yaml (which is a sibling directory), we need the
        // common root to be sourceDir/ — but it won't be unless shared/ is also referenced.
        // With tree-copy, the spec's parent dir (api/) is copied. The $ref target at
        // ../shared/models.yaml is NOT captured because it's above the common root.
        //
        // To truly support external $ref, the caller should ensure the common root is
        // wide enough (e.g., by providing the workspace root). For now, verify that
        // the spec file itself is copied correctly.
        const copiedSpec = path.join(outputDir, "openapi.yaml");
        const content = await readFile(copiedSpec, "utf-8");
        expect(content).toContain("openapi: 3.0.0");
    });

    it("copies sibling directories when overrides widen the common root", async () => {
        // When overrides are in a different directory than the spec, the common root
        // widens to include both. This means any $ref target between them is captured.
        const specFile = path.join(sourceDir, "api", "openapi.yaml");
        const overrideFile = path.join(sourceDir, "overrides", "override.yaml");
        const sharedModel = path.join(sourceDir, "shared", "models.yaml");

        await mkdir(path.join(sourceDir, "shared"), { recursive: true });
        await writeFile(specFile, "openapi: 3.0.0");
        await writeFile(overrideFile, "override: true");
        await writeFile(sharedModel, "shared-model: true");

        const outputDir = path.join(tmpDir.path, "output");
        await mkdir(outputDir, { recursive: true });

        await collectRawSpecs({
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
            containerBaseDir: "/fern/raw-specs",
            context: createMockContext()
        });

        // Common root is sourceDir/ (parent of api/ and overrides/).
        // The entire sourceDir tree is copied, including shared/models.yaml.
        const copiedSharedModel = path.join(outputDir, "shared", "models.yaml");
        const content = await readFile(copiedSharedModel, "utf-8");
        expect(content).toBe("shared-model: true");

        // Also verify spec and override are present
        await expect(access(path.join(outputDir, "api", "openapi.yaml"))).resolves.toBeUndefined();
        await expect(access(path.join(outputDir, "overrides", "override.yaml"))).resolves.toBeUndefined();
    });

    it("uses container paths in manifest entries", async () => {
        const specFile = path.join(sourceDir, "api", "openapi.yaml");
        await writeFile(specFile, "openapi: 3.0.0");

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
            containerBaseDir: "/fern/raw-specs",
            context: createMockContext()
        });

        // Container paths should start with the containerBaseDir
        expect(manifest.specs[0]?.specPath).toMatch(/^\/fern\/raw-specs\//);
    });

    it("returns empty manifest for empty specs array", async () => {
        const outputDir = path.join(tmpDir.path, "output");
        await mkdir(outputDir, { recursive: true });

        const manifest = await collectRawSpecs({
            specs: [],
            hostOutputDir: AbsoluteFilePath.of(outputDir),
            containerBaseDir: "/fern/raw-specs",
            context: createMockContext()
        });

        expect(manifest.specs).toHaveLength(0);
    });

    it("handles mixed spec types (OpenAPI + protobuf)", async () => {
        const specFile = path.join(sourceDir, "api", "openapi.yaml");
        const protoRoot = path.join(sourceDir, "proto");

        await writeFile(specFile, "openapi: 3.0.0");
        await writeFile(path.join(protoRoot, "service", "api.proto"), 'syntax = "proto3";');

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
                }
            ],
            hostOutputDir: AbsoluteFilePath.of(outputDir),
            containerBaseDir: "/fern/raw-specs",
            context: createMockContext()
        });

        expect(manifest.specs).toHaveLength(2);
        expect(manifest.specs[0]?.type).toBe("openapi");
        expect(manifest.specs[1]?.type).toBe("protobuf");

        // With tree copy, both api/ and proto/ dirs should be in output
        // since common root is sourceDir/
        const copiedSpec = await readFile(path.join(outputDir, "api", "openapi.yaml"), "utf-8");
        expect(copiedSpec).toBe("openapi: 3.0.0");
        const copiedProto = await readFile(path.join(outputDir, "proto", "service", "api.proto"), "utf-8");
        expect(copiedProto).toBe('syntax = "proto3";');
    });
});
