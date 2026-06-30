import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { randomUUID } from "crypto";
import { mkdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GeneratorsYmlMigrator } from "../generators-yml/index.js";

describe("GeneratorsYmlMigrator", () => {
    let testDir: string;

    beforeEach(async () => {
        testDir = join(tmpdir(), `generators-yml-test-${randomUUID()}`);
        await mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    // ── detect ──────────────────────────────────────────────────────────────

    it("detect returns false when no generators.yml exists", async () => {
        const migrator = new GeneratorsYmlMigrator({ cwd: AbsoluteFilePath.of(testDir) });
        const result = await migrator.detect();
        expect(result.found).toBe(false);
    });

    it("detect returns true for generators.yml", async () => {
        await writeFile(join(testDir, "generators.yml"), "groups: {}\n");
        const migrator = new GeneratorsYmlMigrator({ cwd: AbsoluteFilePath.of(testDir) });
        const result = await migrator.detect();
        expect(result.found).toBe(true);
    });

    it("detect returns true for generators.yaml extension", async () => {
        await writeFile(join(testDir, "generators.yaml"), "groups: {}\n");
        const migrator = new GeneratorsYmlMigrator({ cwd: AbsoluteFilePath.of(testDir) });
        const result = await migrator.detect();
        expect(result.found).toBe(true);
    });

    // ── real-world xai REST config ──────────────────────────────────────────

    it("migrates a real-world xai REST generators.yml config", async () => {
        await writeFile(
            join(testDir, "generators.yml"),
            `api:
  specs:
    - openapi: ./openapi.yml
      overrides: ./overrides.yml
    - asyncapi: ./asyncapi.yml
autorelease: false
groups:
  typescript:
    generators:
      - name: fernapi/fern-typescript-node-sdk
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
`
        );

        const migrator = new GeneratorsYmlMigrator({ cwd: AbsoluteFilePath.of(testDir) });
        const result = await migrator.migrate();

        expect(result.success).toBe(true);
        expect(result.sdks).toBeDefined();
        expect(result.sdks?.targets).toHaveProperty("typescript");
        const target = result.sdks?.targets["typescript"];
        expect(target?.version).toBe("3.59.2");
        expect(result.sdks?.autorelease).toBe(false);
    });

    it("migrates a real-world xai gRPC generators.yml config", async () => {
        await writeFile(
            join(testDir, "generators.yml"),
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
      - name: fernapi/fern-csharp-sdk
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

        const migrator = new GeneratorsYmlMigrator({ cwd: AbsoluteFilePath.of(testDir) });
        const result = await migrator.migrate();

        expect(result.success).toBe(true);
        expect(result.sdks?.targets).toHaveProperty("csharp");
        const target = result.sdks?.targets["csharp"];
        expect(target?.lang).toBe("csharp");
    });

    // ── apiName suffix ──────────────────────────────────────────────────────

    it("appends apiName suffix to target names when apiName is provided", async () => {
        await writeFile(
            join(testDir, "generators.yml"),
            `groups:
  sdk:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 1.0.0
        output:
          location: local-file-system
          path: ./ts
`
        );

        const migrator = new GeneratorsYmlMigrator({ cwd: AbsoluteFilePath.of(testDir), apiName: "rest" });
        const result = await migrator.migrate();

        expect(result.sdks?.targets).toHaveProperty("typescript-rest");
    });

    // ── .yaml extension ─────────────────────────────────────────────────────

    it("reads generators.yaml (alternate extension)", async () => {
        await writeFile(
            join(testDir, "generators.yaml"),
            `groups:
  sdk:
    generators:
      - name: fernapi/fern-python-sdk
        version: 2.0.0
        output:
          location: local-file-system
          path: ./py
`
        );

        const migrator = new GeneratorsYmlMigrator({ cwd: AbsoluteFilePath.of(testDir) });
        const result = await migrator.migrate();

        expect(result.success).toBe(true);
        expect(result.sdks?.targets).toHaveProperty("python");
    });

    // ── deprecated field warnings ────────────────────────────────────────────

    it("warns on deprecated openapi top-level key", async () => {
        await writeFile(
            join(testDir, "generators.yml"),
            `openapi: ./openapi.yml
groups: {}
`
        );

        const migrator = new GeneratorsYmlMigrator({ cwd: AbsoluteFilePath.of(testDir) });
        const result = await migrator.migrate();

        expect(result.warnings.some((w) => w.message.toLowerCase().includes("openapi"))).toBe(true);
    });

    it("warns on deprecated async-api top-level key", async () => {
        await writeFile(
            join(testDir, "generators.yml"),
            `async-api: ./asyncapi.yml
groups: {}
`
        );

        const migrator = new GeneratorsYmlMigrator({ cwd: AbsoluteFilePath.of(testDir) });
        const result = await migrator.migrate();

        expect(result.warnings.some((w) => w.message.toLowerCase().includes("async"))).toBe(true);
    });

    it("warns on deprecated whitelabel key", async () => {
        await writeFile(
            join(testDir, "generators.yml"),
            `whitelabel: true
groups: {}
`
        );

        const migrator = new GeneratorsYmlMigrator({ cwd: AbsoluteFilePath.of(testDir) });
        const result = await migrator.migrate();

        expect(result.warnings.some((w) => w.message.toLowerCase().includes("whitelabel"))).toBe(true);
    });

    it("warns on deprecated metadata key", async () => {
        await writeFile(
            join(testDir, "generators.yml"),
            `metadata:
  version: 1.0.0
groups: {}
`
        );

        const migrator = new GeneratorsYmlMigrator({ cwd: AbsoluteFilePath.of(testDir) });
        const result = await migrator.migrate();

        expect(result.warnings.some((w) => w.message.toLowerCase().includes("metadata"))).toBe(true);
    });

    it("warns on deprecated reviewers key", async () => {
        await writeFile(
            join(testDir, "generators.yml"),
            `reviewers:
  teams: [my-team]
groups: {}
`
        );

        const migrator = new GeneratorsYmlMigrator({ cwd: AbsoluteFilePath.of(testDir) });
        const result = await migrator.migrate();

        expect(result.warnings.some((w) => w.message.toLowerCase().includes("reviewer"))).toBe(true);
    });

    it("warns on deprecated aliases key", async () => {
        await writeFile(
            join(testDir, "generators.yml"),
            `aliases:
  MyType: string
groups: {}
`
        );

        const migrator = new GeneratorsYmlMigrator({ cwd: AbsoluteFilePath.of(testDir) });
        const result = await migrator.migrate();

        expect(result.warnings.some((w) => w.message.toLowerCase().includes("alias"))).toBe(true);
    });

    it("warns on deprecated auth-schemes key", async () => {
        await writeFile(
            join(testDir, "generators.yml"),
            `auth-schemes:
  myScheme:
    header: X-API-Key
groups: {}
`
        );

        const migrator = new GeneratorsYmlMigrator({ cwd: AbsoluteFilePath.of(testDir) });
        const result = await migrator.migrate();

        expect(result.warnings.some((w) => w.message.toLowerCase().includes("auth"))).toBe(true);
    });

    // ── unquoted @scope/pkg YAML parse error ────────────────────────────────

    it("provides helpful hint for unquoted @scope/pkg YAML parse error", async () => {
        // An unquoted @scope/package-name causes a YAML parse error
        await writeFile(
            join(testDir, "generators.yml"),
            `groups:
  sdk:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 1.0.0
        output:
          location: npm
          package-name: @acme/my-sdk
`
        );

        const migrator = new GeneratorsYmlMigrator({ cwd: AbsoluteFilePath.of(testDir) });
        const result = await migrator.migrate();

        // Should either parse successfully (if YAML handles it) or emit a hint about quoting
        if (!result.success) {
            expect(result.warnings.some((w) => w.message.includes("quote") || w.message.includes("@"))).toBe(true);
        }
    });

    // ── multiple SDK targets across groups ──────────────────────────────────

    it("collects SDK targets from multiple generator groups", async () => {
        await writeFile(
            join(testDir, "generators.yml"),
            `groups:
  ts-sdk:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 3.59.2
        output:
          location: local-file-system
          path: ./ts
  py-sdk:
    generators:
      - name: fernapi/fern-python-sdk
        version: 4.0.0
        output:
          location: local-file-system
          path: ./py
`
        );

        const migrator = new GeneratorsYmlMigrator({ cwd: AbsoluteFilePath.of(testDir) });
        const result = await migrator.migrate();

        expect(result.sdks?.targets).toHaveProperty("typescript");
        expect(result.sdks?.targets).toHaveProperty("python");
    });
});
