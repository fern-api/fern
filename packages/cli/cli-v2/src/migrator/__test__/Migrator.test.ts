import { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { Logger } from "@fern-api/logger";
import { randomUUID } from "crypto";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Migrator } from "../Migrator.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeLogger(): Logger {
    return {
        disable: () => undefined,
        enable: () => undefined,
        trace: () => undefined,
        debug: () => undefined,
        info: () => undefined,
        warn: () => undefined,
        error: () => undefined,
        log: () => undefined
    };
}

async function createProjectDir(base: string) {
    const projectDir = join(base, `migrator-test-${randomUUID()}`);
    await mkdir(projectDir, { recursive: true });
    return projectDir;
}

async function writeFernConfig(fernDir: string, org = "xai", version = "0.44.0") {
    await writeFile(join(fernDir, "fern.config.json"), JSON.stringify({ organization: org, version }));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Migrator", () => {
    let base: string;

    beforeEach(async () => {
        base = join(tmpdir(), `migrator-suite-${randomUUID()}`);
        await mkdir(base, { recursive: true });
    });

    afterEach(async () => {
        await rm(base, { recursive: true, force: true });
    });

    // ── Failure paths ───────────────────────────────────────────────────────

    it("fails when no fern directory is found", async () => {
        const projectDir = await createProjectDir(base);
        const migrator = new Migrator({
            cwd: AbsoluteFilePath.of(projectDir),
            logger: makeLogger()
        });
        const result = await migrator.migrate();
        expect(result.success).toBe(false);
        expect(result.warnings[0]?.message).toContain("fern directory");
    });

    it("fails when fern.config.json is missing organization", async () => {
        const projectDir = await createProjectDir(base);
        const fernDir = join(projectDir, "fern");
        await mkdir(fernDir, { recursive: true });
        await writeFile(join(fernDir, "fern.config.json"), JSON.stringify({ version: "0.44.0" }));
        await writeFile(join(fernDir, "generators.yml"), "groups: {}\n");

        const migrator = new Migrator({
            cwd: AbsoluteFilePath.of(projectDir),
            logger: makeLogger()
        });
        const result = await migrator.migrate();
        expect(result.success).toBe(false);
        expect(result.warnings.some((w) => w.message.includes("organization"))).toBe(true);
    });

    // ── Single-API migrations ───────────────────────────────────────────────

    it("migrates a minimal single-API project", async () => {
        const projectDir = await createProjectDir(base);
        const fernDir = join(projectDir, "fern");
        await mkdir(fernDir, { recursive: true });
        await writeFernConfig(fernDir, "acme");
        await writeFile(
            join(fernDir, "generators.yml"),
            `groups:
  sdk:
    generators:
      - name: fernapi/fern-typescript-sdk
        version: 1.0.0
        output:
          location: local-file-system
          path: ./sdks/typescript
`
        );

        const migrator = new Migrator({
            cwd: AbsoluteFilePath.of(projectDir),
            logger: makeLogger(),
            deleteOriginals: false
        });
        const result = await migrator.migrate();

        expect(result.success).toBe(true);
        const fernYmlContent = await readFile(join(projectDir, "fern.yml"), "utf-8");
        const fernYml = yaml.load(fernYmlContent) as Record<string, unknown>;
        expect(fernYml.org).toBe("acme");
        expect(fernYml.sdks).toBeDefined();
    });

    it("migrates a single-API project with OpenAPI + AsyncAPI specs", async () => {
        const projectDir = await createProjectDir(base);
        const fernDir = join(projectDir, "fern");
        await mkdir(fernDir, { recursive: true });
        await writeFernConfig(fernDir, "xai");
        await writeFile(
            join(fernDir, "generators.yml"),
            `api:
  specs:
    - openapi: ./openapi.yml
      overrides: ./overrides.yml
    - asyncapi: ./asyncapi.yml
groups:
  typescript:
    generators:
      - name: fern-typescript-sdk
        version: 3.59.2
        output:
          location: npm
          package-name: "@xai/sdk"
        github:
          repository: fern-demo/xai-typescript
          mode: pull-request
`
        );

        const migrator = new Migrator({
            cwd: AbsoluteFilePath.of(projectDir),
            logger: makeLogger(),
            deleteOriginals: false
        });
        const result = await migrator.migrate();

        expect(result.success).toBe(true);
        const fernYmlContent = await readFile(join(projectDir, "fern.yml"), "utf-8");
        const fernYml = yaml.load(fernYmlContent) as Record<string, unknown>;
        expect(fernYml.org).toBe("xai");
        expect(fernYml.api).toBeDefined();
        const api = fernYml.api as { specs: Array<{ openapi?: string; asyncapi?: string }> };
        expect(api.specs.some((s) => s.openapi != null)).toBe(true);
        expect(api.specs.some((s) => s.asyncapi != null)).toBe(true);
    });

    it("deletes original fern.config.json and generators.yml by default", async () => {
        const projectDir = await createProjectDir(base);
        const fernDir = join(projectDir, "fern");
        await mkdir(fernDir, { recursive: true });
        await writeFernConfig(fernDir);
        await writeFile(join(fernDir, "generators.yml"), "groups: {}\n");

        const migrator = new Migrator({
            cwd: AbsoluteFilePath.of(projectDir),
            logger: makeLogger(),
            deleteOriginals: true
        });
        await migrator.migrate();

        // Original files should be deleted
        await expect(readFile(join(fernDir, "fern.config.json"), "utf-8")).rejects.toThrow();
        await expect(readFile(join(fernDir, "generators.yml"), "utf-8")).rejects.toThrow();
        // fern.yml should be created
        const fernYmlContent = await readFile(join(projectDir, "fern.yml"), "utf-8");
        expect(fernYmlContent).toContain("org:");
    });

    it("keeps original files when deleteOriginals=false", async () => {
        const projectDir = await createProjectDir(base);
        const fernDir = join(projectDir, "fern");
        await mkdir(fernDir, { recursive: true });
        await writeFernConfig(fernDir);
        await writeFile(join(fernDir, "generators.yml"), "groups: {}\n");

        const migrator = new Migrator({
            cwd: AbsoluteFilePath.of(projectDir),
            logger: makeLogger(),
            deleteOriginals: false
        });
        await migrator.migrate();

        // Original files should still exist
        await expect(readFile(join(fernDir, "fern.config.json"), "utf-8")).resolves.toBeDefined();
        await expect(readFile(join(fernDir, "generators.yml"), "utf-8")).resolves.toBeDefined();
    });

    // ── docs.yml integration ─────────────────────────────────────────────────

    it("includes docs $ref pointer when docs.yml exists in fern directory", async () => {
        const projectDir = await createProjectDir(base);
        const fernDir = join(projectDir, "fern");
        await mkdir(fernDir, { recursive: true });
        await writeFernConfig(fernDir, "acme");
        await writeFile(join(fernDir, "generators.yml"), "groups: {}\n");
        // Create a docs.yml modeled on a real-world Twilio-style config
        await writeFile(
            join(fernDir, "docs.yml"),
            `instances:
  - url: acme.docs.buildwithfern.com
title: Acme API Docs
navigation:
  - section: Getting Started
    contents:
      - page: Introduction
        path: ./pages/introduction.mdx
  - api: API Reference
`
        );

        const migrator = new Migrator({
            cwd: AbsoluteFilePath.of(projectDir),
            logger: makeLogger(),
            deleteOriginals: false
        });
        const result = await migrator.migrate();

        expect(result.success).toBe(true);
        const fernYmlContent = await readFile(join(projectDir, "fern.yml"), "utf-8");
        expect(fernYmlContent).toContain("docs:");
        expect(fernYmlContent).toContain("$ref: ./docs.yml");
        // docs.yml itself should not be deleted or modified
        const docsYmlContent = await readFile(join(fernDir, "docs.yml"), "utf-8");
        expect(docsYmlContent).toContain("instances:");
    });

    it("does not include docs key when docs.yml does not exist", async () => {
        const projectDir = await createProjectDir(base);
        const fernDir = join(projectDir, "fern");
        await mkdir(fernDir, { recursive: true });
        await writeFernConfig(fernDir, "acme");
        await writeFile(join(fernDir, "generators.yml"), "groups: {}\n");

        const migrator = new Migrator({
            cwd: AbsoluteFilePath.of(projectDir),
            logger: makeLogger(),
            deleteOriginals: false
        });
        await migrator.migrate();

        const fernYmlContent = await readFile(join(projectDir, "fern.yml"), "utf-8");
        const fernYml = yaml.load(fernYmlContent) as Record<string, unknown>;
        expect(fernYml.docs).toBeUndefined();
    });

    it("does not inline docs.yml content — only emits $ref pointer", async () => {
        const projectDir = await createProjectDir(base);
        const fernDir = join(projectDir, "fern");
        await mkdir(fernDir, { recursive: true });
        await writeFernConfig(fernDir, "acme");
        await writeFile(join(fernDir, "generators.yml"), "groups: {}\n");
        await writeFile(
            join(fernDir, "docs.yml"),
            `title: My Docs
navigation:
  - api: Reference
tabs:
  api:
    display-name: API
    icon: code
`
        );

        const migrator = new Migrator({
            cwd: AbsoluteFilePath.of(projectDir),
            logger: makeLogger(),
            deleteOriginals: false
        });
        await migrator.migrate();

        const fernYmlContent = await readFile(join(projectDir, "fern.yml"), "utf-8");
        // Should NOT contain inlined docs content
        expect(fernYmlContent).not.toContain("title: My Docs");
        expect(fernYmlContent).not.toContain("navigation:");
        expect(fernYmlContent).not.toContain("tabs:");
        // Should only contain the $ref pointer
        expect(fernYmlContent).toContain("$ref: ./docs.yml");
    });

    // ── Multi-API migrations ─────────────────────────────────────────────────

    it("migrates a multi-API project (xai-like: rest + grpc)", async () => {
        const projectDir = await createProjectDir(base);
        const fernDir = join(projectDir, "fern");
        const apisDir = join(fernDir, "apis");
        const restDir = join(apisDir, "rest");
        const grpcDir = join(apisDir, "grpc");

        await mkdir(restDir, { recursive: true });
        await mkdir(grpcDir, { recursive: true });
        await writeFernConfig(fernDir, "xai");

        // REST generators.yml — mirrors real xai config
        await writeFile(
            join(restDir, "generators.yml"),
            `api:
  specs:
    - openapi: ./openapi.yml
      overrides: ./overrides.yml
    - asyncapi: ./asyncapi.yml
autorelease: false
groups:
  typescript:
    generators:
      - name: fern-typescript-sdk
        version: 3.59.2
        output:
          location: npm
          package-name: xai
        github:
          repository: fern-demo/xai-typescript
          mode: pull-request
        config:
          naming:
            namespace: xai
          generateWebSocketClients: true
  rust:
    generators:
      - name: fern-rust-sdk
        version: 0.26.6
        output:
          location: crates
          package-name: xai
        github:
          repository: fern-demo/xai-rust-internal
          mode: pull-request
        config:
          clientClassName: XaiClient
          crateName: xai
`
        );

        // gRPC generators.yml — mirrors real xai config
        await writeFile(
            join(grpcDir, "generators.yml"),
            `api:
  specs:
    - proto:
        root: ./proto
        overrides: ./overrides.yml
        from-openapi: true
        local-generation: true
autorelease: false
groups:
  dotnet:
    generators:
      - name: fern-csharp-sdk
        version: 2.32.0
        output:
          location: nuget
          package-name: Xai
        github:
          repository: fern-demo/xai-dotnet
          mode: pull-request
        config:
          namespace: Xai
          client-class-name: XaiClient
`
        );

        const migrator = new Migrator({
            cwd: AbsoluteFilePath.of(projectDir),
            logger: makeLogger(),
            deleteOriginals: false
        });
        const result = await migrator.migrate();

        expect(result.success).toBe(true);
        const fernYmlContent = await readFile(join(projectDir, "fern.yml"), "utf-8");
        const fernYml = yaml.load(fernYmlContent) as Record<string, unknown>;

        expect(fernYml.org).toBe("xai");
        // Should have apis key (multi-api), not api key
        expect(fernYml.apis).toBeDefined();
        expect(fernYml.api).toBeUndefined();

        const apis = fernYml.apis as Record<string, unknown>;
        expect(apis).toHaveProperty("rest");
        expect(apis).toHaveProperty("grpc");

        // SDK targets from both APIs combined
        const sdks = fernYml.sdks as { targets: Record<string, unknown> } | undefined;
        expect(sdks?.targets).toHaveProperty("typescript-rest");
        expect(sdks?.targets).toHaveProperty("rust-rest");
        expect(sdks?.targets).toHaveProperty("csharp-grpc");
    });

    it("migrates multi-API project with docs.yml", async () => {
        const projectDir = await createProjectDir(base);
        const fernDir = join(projectDir, "fern");
        const apisDir = join(fernDir, "apis");
        await mkdir(join(apisDir, "rest"), { recursive: true });
        await mkdir(join(apisDir, "grpc"), { recursive: true });
        await writeFernConfig(fernDir, "xai");

        await writeFile(
            join(apisDir, "rest", "generators.yml"),
            `api:
  specs:
    - openapi: ./openapi.yml
groups:
  sdk:
    generators:
      - name: fern-typescript-sdk
        version: 3.59.2
        output:
          location: local-file-system
          path: ./sdks/ts
`
        );
        await writeFile(join(apisDir, "grpc", "generators.yml"), "groups: {}\n");

        // docs.yml with versioned docs (Twilio-style)
        await writeFile(
            join(fernDir, "docs.yml"),
            `instances:
  - url: xai.docs.buildwithfern.com
title: xAI API Documentation
versions:
  - display-name: v1
    path: ./versions/v1.yml
navigation:
  - api: API Reference
`
        );

        const migrator = new Migrator({
            cwd: AbsoluteFilePath.of(projectDir),
            logger: makeLogger(),
            deleteOriginals: false
        });
        const result = await migrator.migrate();

        expect(result.success).toBe(true);
        const fernYmlContent = await readFile(join(projectDir, "fern.yml"), "utf-8");
        expect(fernYmlContent).toContain("$ref: ./docs.yml");
        expect(fernYmlContent).toContain("apis:");
    });

    it("adjusts spec paths to be root-relative in multi-API migration", async () => {
        const projectDir = await createProjectDir(base);
        const fernDir = join(projectDir, "fern");
        const apisDir = join(fernDir, "apis");
        await mkdir(join(apisDir, "rest"), { recursive: true });
        await writeFernConfig(fernDir, "xai");

        await writeFile(
            join(apisDir, "rest", "generators.yml"),
            `api:
  specs:
    - openapi: ./openapi.yml
      overrides: ./overrides.yml
    - asyncapi: ./asyncapi.yml
groups: {}
`
        );

        const migrator = new Migrator({
            cwd: AbsoluteFilePath.of(projectDir),
            logger: makeLogger(),
            deleteOriginals: false
        });
        await migrator.migrate();

        const fernYmlContent = await readFile(join(projectDir, "fern.yml"), "utf-8");
        expect(fernYmlContent).toContain("fern/apis/rest/openapi.yml");
        expect(fernYmlContent).toContain("fern/apis/rest/overrides.yml");
        expect(fernYmlContent).toContain("fern/apis/rest/asyncapi.yml");
    });

    it("drops defaultGroup and group from all SDK targets", async () => {
        const projectDir = await createProjectDir(base);
        const fernDir = join(projectDir, "fern");
        await mkdir(fernDir, { recursive: true });
        await writeFernConfig(fernDir, "acme");
        await writeFile(
            join(fernDir, "generators.yml"),
            `default-group: production
groups:
  staging:
    generators:
      - name: fernapi/fern-python-sdk
        version: 1.0.0
        output:
          location: local-file-system
          path: ./py
  production:
    generators:
      - name: fernapi/fern-python-sdk
        version: 2.0.0
        output:
          location: local-file-system
          path: ./py-prod
`
        );

        const migrator = new Migrator({
            cwd: AbsoluteFilePath.of(projectDir),
            logger: makeLogger(),
            deleteOriginals: false
        });
        await migrator.migrate();

        const fernYmlContent = await readFile(join(projectDir, "fern.yml"), "utf-8");
        expect(fernYmlContent).not.toContain("defaultGroup");
        expect(fernYmlContent).not.toContain("default-group");
        // The group field on targets should not be present
        const fernYml = yaml.load(fernYmlContent) as { sdks?: { targets: Record<string, unknown> } };
        for (const target of Object.values(fernYml.sdks?.targets ?? {})) {
            expect(target).not.toHaveProperty("group");
            expect(target).not.toHaveProperty("defaultGroup");
        }
    });

    // ── GitHub workflow migration ───────────────────────────────────────────

    it("migrates GitHub workflows alongside fern.yml creation", async () => {
        const projectDir = await createProjectDir(base);
        const fernDir = join(projectDir, "fern");
        const workflowsDir = join(projectDir, ".github", "workflows");
        await mkdir(fernDir, { recursive: true });
        await mkdir(workflowsDir, { recursive: true });
        await writeFernConfig(fernDir, "acme");
        await writeFile(join(fernDir, "generators.yml"), "groups: {}\n");
        await writeFile(
            join(workflowsDir, "publish.yml"),
            `name: Publish SDK
on:
  push:
    branches: [main]
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: fern generate --group production
`
        );

        const migrator = new Migrator({
            cwd: AbsoluteFilePath.of(projectDir),
            logger: makeLogger(),
            deleteOriginals: false
        });
        const result = await migrator.migrate();

        expect(result.success).toBe(true);
        const workflowContent = await readFile(join(workflowsDir, "publish.yml"), "utf-8");
        expect(workflowContent).toContain("fern sdk generate --target production");
        expect(workflowContent).not.toContain("fern generate --group");
        // Should have a warning about the migrated workflow
        expect(result.warnings.some((w) => w.message.includes("publish.yml"))).toBe(true);
    });

    it("does not touch GitHub workflows when they have no fern generate commands", async () => {
        const projectDir = await createProjectDir(base);
        const fernDir = join(projectDir, "fern");
        const workflowsDir = join(projectDir, ".github", "workflows");
        await mkdir(fernDir, { recursive: true });
        await mkdir(workflowsDir, { recursive: true });
        await writeFernConfig(fernDir, "acme");
        await writeFile(join(fernDir, "generators.yml"), "groups: {}\n");

        const original = `name: CI
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test
`;
        await writeFile(join(workflowsDir, "ci.yml"), original);

        const migrator = new Migrator({
            cwd: AbsoluteFilePath.of(projectDir),
            logger: makeLogger(),
            deleteOriginals: false
        });
        const result = await migrator.migrate();

        const workflowContent = await readFile(join(workflowsDir, "ci.yml"), "utf-8");
        expect(workflowContent).toBe(original);
        expect(result.warnings.some((w) => w.message.includes("ci.yml"))).toBe(false);
    });

    // ── findFernDirectory ──────────────────────────────────────────────────

    it("finds fern directory when cwd IS the fern directory", async () => {
        const projectDir = await createProjectDir(base);
        const fernDir = join(projectDir, "fern");
        await mkdir(fernDir, { recursive: true });
        await writeFernConfig(fernDir, "acme");
        await writeFile(join(fernDir, "generators.yml"), "groups: {}\n");

        // Run from inside the fern directory itself
        const migrator = new Migrator({
            cwd: AbsoluteFilePath.of(fernDir),
            logger: makeLogger(),
            deleteOriginals: false
        });
        const result = await migrator.migrate();
        // fern.yml is written to cwd (fernDir) not projectDir
        expect(result.success).toBe(true);
        const fernYmlContent = await readFile(join(fernDir, "fern.yml"), "utf-8");
        expect(fernYmlContent).toContain("org: acme");
    });

    // ── Root generators.yml warning in multi-API ──────────────────────────

    it("warns when generators.yml exists in fern root alongside apis/ directory", async () => {
        const projectDir = await createProjectDir(base);
        const fernDir = join(projectDir, "fern");
        const apisDir = join(fernDir, "apis");
        await mkdir(join(apisDir, "rest"), { recursive: true });
        await writeFernConfig(fernDir, "xai");

        // generators.yml at fern root (unusual in multi-API setup)
        await writeFile(join(fernDir, "generators.yml"), "groups: {}\n");
        await writeFile(join(apisDir, "rest", "generators.yml"), "groups: {}\n");

        const migrator = new Migrator({
            cwd: AbsoluteFilePath.of(projectDir),
            logger: makeLogger(),
            deleteOriginals: false
        });
        const result = await migrator.migrate();

        expect(result.success).toBe(true);
        expect(result.warnings.some((w) => w.message.includes("generators.yml in fern root"))).toBe(true);
    });
});
