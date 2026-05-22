import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { copySpecs, hasOpenApiSpecs, type RawSpecsManifest } from "../copySpecs.js";
import type { DetectedAuthBinding } from "../detectAuth.js";

const BIN = "acme";
const BIN_DIR = path.join("cli", BIN);

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

    it("no manifest → no-op (binDir not created)", async () => {
        const outputDir = path.join(tmpDir, "out");
        await mkdir(outputDir, { recursive: true });

        await copySpecs({
            outputDir,
            binaryName: BIN,
            authBindings: [],
            specsDir: path.join(tmpDir, "missing-specs")
        });

        await expect(access(path.join(outputDir, BIN_DIR))).rejects.toThrow();
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

        await copySpecs({ outputDir, binaryName: BIN, authBindings: [], specsDir });

        await expect(access(path.join(outputDir, BIN_DIR))).rejects.toThrow();
    });

    it("single openapi spec, no auth bindings → writes spec + emits single-.spec() main.rs", async () => {
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

        await copySpecs({ outputDir, binaryName: BIN, authBindings: [], specsDir });

        expect(await readFile(path.join(outputDir, BIN_DIR, "openapi0.json"), "utf-8")).toBe(
            '{"openapi":"3.0.0","info":{"title":"users"}}'
        );
        const main = await readFile(path.join(outputDir, BIN_DIR, "main.rs"), "utf-8");
        expect(main).toContain(`CliApp::new("${BIN}")`);
        expect(main).toContain('.spec(include_str!("openapi0.json"))');
        // No bindings supplied → no auth calls + no AuthCredentialSource import.
        expect(main).not.toContain(".auth_scheme_env");
        expect(main).not.toContain(".auth_basic_scheme");
        expect(main).not.toContain("AuthCredentialSource");
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

        await copySpecs({ outputDir, binaryName: BIN, authBindings: [], specsDir });

        expect(await readFile(path.join(outputDir, BIN_DIR, "openapi0.json"), "utf-8")).toBe(
            '{"openapi":"3.0.0","info":{"title":"users"}}'
        );
        expect(await readFile(path.join(outputDir, BIN_DIR, "openapi1.json"), "utf-8")).toBe(
            '{"openapi":"3.0.0","info":{"title":"billing"}}'
        );
        const main = await readFile(path.join(outputDir, BIN_DIR, "main.rs"), "utf-8");
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

        await copySpecs({ outputDir, binaryName: BIN, authBindings: [], specsDir });

        const main = await readFile(path.join(outputDir, BIN_DIR, "main.rs"), "utf-8");
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

        await copySpecs({ outputDir, binaryName: BIN, authBindings: [], specsDir });

        const main = await readFile(path.join(outputDir, BIN_DIR, "main.rs"), "utf-8");
        expect(main).toContain('.spec(include_str!("openapi0.json"))');
        expect(main).toContain('.spec_under("admin", include_str!("openapi1.json"))');
    });

    it("threads supplied auth bindings into main.rs, in supplied order", async () => {
        const specsDir = path.join(tmpDir, "specs");
        await mkdir(specsDir, { recursive: true });
        await writeFile(path.join(specsDir, "openapi0.json"), '{"openapi":"3.0.0"}');
        await writeFile(
            path.join(specsDir, "specs-manifest.json"),
            JSON.stringify({
                specs: [{ type: "openapi", specPath: path.join(specsDir, "openapi0.json") }]
            } satisfies RawSpecsManifest)
        );
        const outputDir = path.join(tmpDir, "out");
        await mkdir(outputDir, { recursive: true });

        const bindings: DetectedAuthBinding[] = [
            {
                schemeName: "ApiKeyAuth",
                rustCall:
                    '.auth_basic_scheme("ApiKeyAuth", ' +
                    'AuthCredentialSource::from_env("CLOSE_API_KEY"), ' +
                    'AuthCredentialSource::literal(""))',
                needsCredentialSourceImport: true
            },
            {
                schemeName: "OAuth2",
                rustCall: '.auth_scheme_env("OAuth2", "CLOSE_TOKEN")',
                needsCredentialSourceImport: false
            }
        ];
        await copySpecs({ outputDir, binaryName: "close", authBindings: bindings, specsDir });

        const main = await readFile(path.join(outputDir, "cli", "close", "main.rs"), "utf-8");
        // Import for AuthCredentialSource is emitted because at least one
        // binding sets needsCredentialSourceImport, and it sits above the
        // CliApp import for stable ordering.
        const credImportIdx = main.indexOf("use fern_cli_sdk::auth::AuthCredentialSource;");
        const cliImportIdx = main.indexOf("use fern_cli_sdk::openapi::CliApp;");
        expect(credImportIdx).toBeGreaterThanOrEqual(0);
        expect(cliImportIdx).toBeGreaterThan(credImportIdx);

        // Bindings appear inline in the builder chain in the order supplied.
        const basicIdx = main.indexOf('.auth_basic_scheme("ApiKeyAuth"');
        const bearerIdx = main.indexOf('.auth_scheme_env("OAuth2", "CLOSE_TOKEN")');
        expect(basicIdx).toBeGreaterThan(0);
        expect(bearerIdx).toBeGreaterThan(basicIdx);
    });

    it("only emits AuthCredentialSource import when at least one binding needs it", async () => {
        const specsDir = path.join(tmpDir, "specs");
        await mkdir(specsDir, { recursive: true });
        await writeFile(path.join(specsDir, "openapi0.json"), '{"openapi":"3.0.0"}');
        await writeFile(
            path.join(specsDir, "specs-manifest.json"),
            JSON.stringify({
                specs: [{ type: "openapi", specPath: path.join(specsDir, "openapi0.json") }]
            } satisfies RawSpecsManifest)
        );
        const outputDir = path.join(tmpDir, "out");
        await mkdir(outputDir, { recursive: true });

        await copySpecs({
            outputDir,
            binaryName: BIN,
            authBindings: [
                {
                    schemeName: "Bearer",
                    rustCall: '.auth_scheme_env("Bearer", "ACME_TOKEN")',
                    needsCredentialSourceImport: false
                }
            ],
            specsDir
        });

        const main = await readFile(path.join(outputDir, BIN_DIR, "main.rs"), "utf-8");
        expect(main).toContain('.auth_scheme_env("Bearer", "ACME_TOKEN")');
        expect(main).not.toContain("AuthCredentialSource");
    });
});
