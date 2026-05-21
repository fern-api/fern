import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { copySpecs, FIXTURE_DIR, hasOpenApiSpecs, type RawSpecsManifest } from "../copySpecs.js";

describe("hasOpenApiSpecs", () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "hasOpenApi-"));
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    it("returns false when no manifest is mounted", async () => {
        expect(await hasOpenApiSpecs(path.join(tmpDir, "missing"))).toBe(false);
    });

    it("returns false for non-openapi-only manifests", async () => {
        const specsDir = path.join(tmpDir, "specs");
        await mkdir(specsDir, { recursive: true });
        await writeFile(
            path.join(specsDir, "specs-manifest.json"),
            JSON.stringify({
                specs: [{ type: "protobuf", specPath: "/dev/null" }]
            } satisfies RawSpecsManifest)
        );
        expect(await hasOpenApiSpecs(specsDir)).toBe(false);
    });

    it("returns true when at least one openapi spec is mounted", async () => {
        const specsDir = path.join(tmpDir, "specs");
        await mkdir(specsDir, { recursive: true });
        await writeFile(
            path.join(specsDir, "specs-manifest.json"),
            JSON.stringify({
                specs: [
                    { type: "protobuf", specPath: "/dev/null" },
                    { type: "openapi", specPath: "/dev/null" }
                ]
            } satisfies RawSpecsManifest)
        );
        expect(await hasOpenApiSpecs(specsDir)).toBe(true);
    });
});

describe("copySpecs", () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "copySpecs-"));
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    it("no manifest → no-op (FIXTURE_DIR not created)", async () => {
        const outputDir = path.join(tmpDir, "out");
        await mkdir(outputDir, { recursive: true });

        await copySpecs(outputDir, path.join(tmpDir, "missing-specs"));

        await expect(access(path.join(outputDir, FIXTURE_DIR))).rejects.toThrow();
    });

    it("non-openapi specs only → no-op", async () => {
        const specsDir = path.join(tmpDir, "specs");
        await mkdir(specsDir, { recursive: true });
        await writeFile(path.join(specsDir, "schema.proto"), 'syntax = "proto3";\n');
        await writeFile(
            path.join(specsDir, "specs-manifest.json"),
            JSON.stringify({
                specs: [{ type: "protobuf", specPath: path.join(specsDir, "schema.proto") }]
            } satisfies RawSpecsManifest)
        );
        const outputDir = path.join(tmpDir, "out");
        await mkdir(outputDir, { recursive: true });

        await copySpecs(outputDir, specsDir);

        await expect(access(path.join(outputDir, FIXTURE_DIR))).rejects.toThrow();
    });

    it("single openapi spec → writes spec + emits single-.spec() main.rs from scratch", async () => {
        const specsDir = path.join(tmpDir, "specs");
        await mkdir(specsDir, { recursive: true });
        await writeFile(path.join(specsDir, "openapi0.json"), '{"openapi":"3.0.0","info":{"title":"users"}}');
        await writeFile(
            path.join(specsDir, "specs-manifest.json"),
            JSON.stringify({
                specs: [{ type: "openapi", specPath: path.join(specsDir, "openapi0.json") }]
            } satisfies RawSpecsManifest)
        );
        const outputDir = path.join(tmpDir, "out");
        await mkdir(outputDir, { recursive: true });

        await copySpecs(outputDir, specsDir);

        expect(await readFile(path.join(outputDir, FIXTURE_DIR, "openapi0.json"), "utf-8")).toBe(
            '{"openapi":"3.0.0","info":{"title":"users"}}'
        );
        const main = await readFile(path.join(outputDir, FIXTURE_DIR, "main.rs"), "utf-8");
        expect(main).toContain('.spec(include_str!("openapi0.json"))');
        expect(main).not.toContain(".spec_under");
    });

    it("multi-spec without namespace → emits .spec(...) per entry so they merge flat at the root", async () => {
        const specsDir = path.join(tmpDir, "specs");
        await mkdir(specsDir, { recursive: true });
        await writeFile(path.join(specsDir, "openapi0.json"), '{"openapi":"3.0.0","info":{"title":"users"}}');
        await writeFile(path.join(specsDir, "openapi1.json"), '{"openapi":"3.0.0","info":{"title":"billing"}}');
        await writeFile(
            path.join(specsDir, "specs-manifest.json"),
            JSON.stringify({
                specs: [
                    { type: "openapi", specPath: path.join(specsDir, "openapi0.json") },
                    { type: "openapi", specPath: path.join(specsDir, "openapi1.json") }
                ]
            } satisfies RawSpecsManifest)
        );
        const outputDir = path.join(tmpDir, "out");
        await mkdir(outputDir, { recursive: true });

        await copySpecs(outputDir, specsDir);

        expect(await readFile(path.join(outputDir, FIXTURE_DIR, "openapi0.json"), "utf-8")).toBe(
            '{"openapi":"3.0.0","info":{"title":"users"}}'
        );
        expect(await readFile(path.join(outputDir, FIXTURE_DIR, "openapi1.json"), "utf-8")).toBe(
            '{"openapi":"3.0.0","info":{"title":"billing"}}'
        );
        const main = await readFile(path.join(outputDir, FIXTURE_DIR, "main.rs"), "utf-8");
        expect(main).toContain('.spec(include_str!("openapi0.json"))');
        expect(main).toContain('.spec(include_str!("openapi1.json"))');
        expect(main).not.toContain(".spec_under");
    });

    it("multi-spec with namespaces → emits .spec_under('<ns>', ...) per entry", async () => {
        const specsDir = path.join(tmpDir, "specs");
        await mkdir(specsDir, { recursive: true });
        await writeFile(path.join(specsDir, "openapi0.json"), '{"openapi":"3.0.0","info":{"title":"v1"}}');
        await writeFile(path.join(specsDir, "openapi1.json"), '{"openapi":"3.0.0","info":{"title":"v2"}}');
        await writeFile(
            path.join(specsDir, "specs-manifest.json"),
            JSON.stringify({
                specs: [
                    { type: "openapi", specPath: path.join(specsDir, "openapi0.json"), namespace: "v1" },
                    { type: "openapi", specPath: path.join(specsDir, "openapi1.json"), namespace: "v2" }
                ]
            } satisfies RawSpecsManifest)
        );
        const outputDir = path.join(tmpDir, "out");
        await mkdir(outputDir, { recursive: true });

        await copySpecs(outputDir, specsDir);

        const main = await readFile(path.join(outputDir, FIXTURE_DIR, "main.rs"), "utf-8");
        expect(main).toContain('.spec_under("v1", include_str!("openapi0.json"))');
        expect(main).toContain('.spec_under("v2", include_str!("openapi1.json"))');
        expect(main).not.toMatch(/\.spec\(include_str!/);
    });

    it("mixed: spec without namespace uses .spec(), spec with namespace uses .spec_under()", async () => {
        const specsDir = path.join(tmpDir, "specs");
        await mkdir(specsDir, { recursive: true });
        await writeFile(path.join(specsDir, "openapi0.json"), '{"openapi":"3.0.0","info":{"title":"root"}}');
        await writeFile(path.join(specsDir, "openapi1.json"), '{"openapi":"3.0.0","info":{"title":"admin"}}');
        await writeFile(
            path.join(specsDir, "specs-manifest.json"),
            JSON.stringify({
                specs: [
                    { type: "openapi", specPath: path.join(specsDir, "openapi0.json") },
                    { type: "openapi", specPath: path.join(specsDir, "openapi1.json"), namespace: "admin" }
                ]
            } satisfies RawSpecsManifest)
        );
        const outputDir = path.join(tmpDir, "out");
        await mkdir(outputDir, { recursive: true });

        await copySpecs(outputDir, specsDir);

        const main = await readFile(path.join(outputDir, FIXTURE_DIR, "main.rs"), "utf-8");
        expect(main).toContain('.spec(include_str!("openapi0.json"))');
        expect(main).toContain('.spec_under("admin", include_str!("openapi1.json"))');
    });
});
