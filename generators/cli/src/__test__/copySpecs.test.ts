import { mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { copyRawSpecs, copySpecFile, type RawSpecsManifest } from "../copySpecs.js";

describe("copySpecFile", () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "copySpecs-"));
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    it("copies a file and returns relative path", async () => {
        const sourceDir = path.join(tmpDir, "source");
        await mkdir(path.join(sourceDir, "api"), { recursive: true });
        await writeFile(path.join(sourceDir, "api", "spec.yaml"), "openapi: 3.0.0");

        const outputDir = path.join(tmpDir, "output");
        await mkdir(outputDir, { recursive: true });

        const result = await copySpecFile(path.join(sourceDir, "api", "spec.yaml"), outputDir, sourceDir);

        expect(result).toBe(path.join("api", "spec.yaml"));
        const content = await readFile(path.join(outputDir, "api", "spec.yaml"), "utf-8");
        expect(content).toBe("openapi: 3.0.0");
    });

    it("copies a directory recursively for protobuf", async () => {
        const sourceDir = path.join(tmpDir, "source");
        const protoDir = path.join(sourceDir, "proto");
        await mkdir(path.join(protoDir, "service"), { recursive: true });
        await writeFile(path.join(protoDir, "service", "api.proto"), 'syntax = "proto3";');

        const outputDir = path.join(tmpDir, "output");
        await mkdir(outputDir, { recursive: true });

        const result = await copySpecFile(protoDir, outputDir, sourceDir);

        expect(result).toBe("proto");
        const content = await readFile(path.join(outputDir, "proto", "service", "api.proto"), "utf-8");
        expect(content).toBe('syntax = "proto3";');
    });

    it("falls back to basename when path does not start with specsDir", async () => {
        const sourceFile = path.join(tmpDir, "random", "spec.yaml");
        await mkdir(path.join(tmpDir, "random"), { recursive: true });
        await writeFile(sourceFile, "test");

        const outputDir = path.join(tmpDir, "output");
        await mkdir(outputDir, { recursive: true });

        const result = await copySpecFile(sourceFile, outputDir, "/nonexistent");

        expect(result).toBe("spec.yaml");
    });
});

describe("copyRawSpecs", () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "copyRawSpecs-"));
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    it("does nothing when no manifest exists", async () => {
        const outputDir = path.join(tmpDir, "output");
        await mkdir(outputDir, { recursive: true });

        // Should not throw
        await copyRawSpecs(outputDir, path.join(tmpDir, "nonexistent"));

        // specs/ dir should not be created
        try {
            await readFile(path.join(outputDir, "specs", "specs-manifest.json"), "utf-8");
            expect.fail("Should not have created specs directory");
        } catch {
            // expected
        }
    });

    it("does nothing when manifest has empty specs array", async () => {
        const rawSpecsDir = path.join(tmpDir, "raw-specs");
        await mkdir(rawSpecsDir, { recursive: true });
        const manifest: RawSpecsManifest = { specs: [] };
        await writeFile(path.join(rawSpecsDir, "specs-manifest.json"), JSON.stringify(manifest));

        const outputDir = path.join(tmpDir, "output");
        await mkdir(outputDir, { recursive: true });

        await copyRawSpecs(outputDir, rawSpecsDir);

        // specs/ dir should not be created
        try {
            await readFile(path.join(outputDir, "specs", "specs-manifest.json"), "utf-8");
            expect.fail("Should not have created specs directory");
        } catch {
            // expected
        }
    });

    it("copies OpenAPI spec and writes output manifest", async () => {
        const rawSpecsDir = path.join(tmpDir, "raw-specs");
        await mkdir(path.join(rawSpecsDir, "api"), { recursive: true });
        await writeFile(path.join(rawSpecsDir, "api", "openapi.yaml"), "openapi: 3.0.0");

        const manifest: RawSpecsManifest = {
            specs: [
                {
                    type: "openapi",
                    specPath: path.join(rawSpecsDir, "api", "openapi.yaml")
                }
            ]
        };
        await writeFile(path.join(rawSpecsDir, "specs-manifest.json"), JSON.stringify(manifest));

        const outputDir = path.join(tmpDir, "output");
        await mkdir(outputDir, { recursive: true });

        await copyRawSpecs(outputDir, rawSpecsDir);

        // Verify spec file was copied
        const specContent = await readFile(path.join(outputDir, "specs", "api", "openapi.yaml"), "utf-8");
        expect(specContent).toBe("openapi: 3.0.0");

        // Verify output manifest was written with relative paths
        const outputManifest: RawSpecsManifest = JSON.parse(
            await readFile(path.join(outputDir, "specs", "specs-manifest.json"), "utf-8")
        );
        expect(outputManifest.specs).toHaveLength(1);
        expect(outputManifest.specs[0]?.type).toBe("openapi");
        expect(outputManifest.specs[0]?.specPath).toBe(path.join("api", "openapi.yaml"));
    });

    it("copies spec with overrides", async () => {
        const rawSpecsDir = path.join(tmpDir, "raw-specs");
        await mkdir(path.join(rawSpecsDir, "api"), { recursive: true });
        await mkdir(path.join(rawSpecsDir, "overrides"), { recursive: true });

        await writeFile(path.join(rawSpecsDir, "api", "spec.yaml"), "spec");
        await writeFile(path.join(rawSpecsDir, "overrides", "override.yaml"), "override");

        const manifest: RawSpecsManifest = {
            specs: [
                {
                    type: "openapi",
                    specPath: path.join(rawSpecsDir, "api", "spec.yaml"),
                    overridePaths: [path.join(rawSpecsDir, "overrides", "override.yaml")]
                }
            ]
        };
        await writeFile(path.join(rawSpecsDir, "specs-manifest.json"), JSON.stringify(manifest));

        const outputDir = path.join(tmpDir, "output");
        await mkdir(outputDir, { recursive: true });

        await copyRawSpecs(outputDir, rawSpecsDir);

        // Verify all files were copied
        expect(await readFile(path.join(outputDir, "specs", "api", "spec.yaml"), "utf-8")).toBe("spec");
        expect(await readFile(path.join(outputDir, "specs", "overrides", "override.yaml"), "utf-8")).toBe("override");

        // Verify output manifest has correct relative paths
        const outputManifest: RawSpecsManifest = JSON.parse(
            await readFile(path.join(outputDir, "specs", "specs-manifest.json"), "utf-8")
        );
        expect(outputManifest.specs[0]?.overridePaths).toHaveLength(1);
    });

    it("copies protobuf directory spec", async () => {
        const rawSpecsDir = path.join(tmpDir, "raw-specs");
        const protoDir = path.join(rawSpecsDir, "proto");
        await mkdir(path.join(protoDir, "service"), { recursive: true });
        await writeFile(path.join(protoDir, "service", "api.proto"), 'syntax = "proto3";');

        const manifest: RawSpecsManifest = {
            specs: [
                {
                    type: "protobuf",
                    specPath: path.join(rawSpecsDir, "proto")
                }
            ]
        };
        await writeFile(path.join(rawSpecsDir, "specs-manifest.json"), JSON.stringify(manifest));

        const outputDir = path.join(tmpDir, "output");
        await mkdir(outputDir, { recursive: true });

        await copyRawSpecs(outputDir, rawSpecsDir);

        // Verify protobuf directory was copied recursively
        const protoContent = await readFile(path.join(outputDir, "specs", "proto", "service", "api.proto"), "utf-8");
        expect(protoContent).toBe('syntax = "proto3";');
    });
});
