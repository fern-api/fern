/**
 * Customer config migration tests.
 *
 * Each test sets up a realistic legacy Fern project directory structure
 * (fern.config.json, generators.yml, docs.yml, .github/workflows/*)
 * and asserts the full migrated fern.yml output.
 */
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

interface ProjectFiles {
    /** fern.config.json content */
    fernConfig: { organization: string; version: string };
    /** generators.yml content (single-API) or per-API generators.yml (multi-API) */
    generatorsYml?: string;
    /** Multi-API: map of apiName -> generators.yml content */
    apis?: Record<string, string>;
    /** docs.yml content (optional) */
    docsYml?: string;
    /** GitHub workflow files: filename -> content */
    workflows?: Record<string, string>;
}

async function setupProject(base: string, files: ProjectFiles): Promise<string> {
    const projectDir = join(base, `customer-${randomUUID()}`);
    const fernDir = join(projectDir, "fern");
    await mkdir(fernDir, { recursive: true });

    await writeFile(join(fernDir, "fern.config.json"), JSON.stringify(files.fernConfig));

    if (files.apis != null) {
        const apisDir = join(fernDir, "apis");
        for (const [apiName, content] of Object.entries(files.apis)) {
            const apiDir = join(apisDir, apiName);
            await mkdir(apiDir, { recursive: true });
            await writeFile(join(apiDir, "generators.yml"), content);
        }
    } else if (files.generatorsYml != null) {
        await writeFile(join(fernDir, "generators.yml"), files.generatorsYml);
    }

    if (files.docsYml != null) {
        await writeFile(join(fernDir, "docs.yml"), files.docsYml);
    }

    if (files.workflows != null) {
        const workflowsDir = join(projectDir, ".github", "workflows");
        await mkdir(workflowsDir, { recursive: true });
        for (const [filename, content] of Object.entries(files.workflows)) {
            await writeFile(join(workflowsDir, filename), content);
        }
    }

    return projectDir;
}

async function runMigration(projectDir: string) {
    const migrator = new Migrator({
        cwd: AbsoluteFilePath.of(projectDir),
        logger: makeLogger(),
        deleteOriginals: false
    });
    return migrator.migrate();
}

async function readMigratedYml(projectDir: string): Promise<Record<string, unknown>> {
    const content = await readFile(join(projectDir, "fern.yml"), "utf-8");
    return yaml.load(content) as Record<string, unknown>;
}

async function readMigratedYmlRaw(projectDir: string): Promise<string> {
    return readFile(join(projectDir, "fern.yml"), "utf-8");
}

// ---------------------------------------------------------------------------
// Customer config collection
// ---------------------------------------------------------------------------

describe("Customer config migrations", () => {
    let base: string;

    beforeEach(async () => {
        base = join(tmpdir(), `customer-configs-${randomUUID()}`);
        await mkdir(base, { recursive: true });
    });

    afterEach(async () => {
        await rm(base, { recursive: true, force: true });
    });

    // ── 1. Minimal TypeScript SDK (e.g. small startup) ──────────────────

    it("migrates a minimal single-SDK project with local output", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "acme", version: "0.44.0" },
            generatorsYml: `groups:
  sdk:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 1.5.0
        output:
          location: local-file-system
          path: ./sdks/typescript
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        expect(yml.org).toBe("acme");
        expect(yml.sdks).toBeDefined();

        const sdks = yml.sdks as { targets: Record<string, { lang: string; version: string; output: unknown }> };
        expect(sdks.targets).toHaveProperty("typescript");
        expect(sdks.targets.typescript.lang).toBe("typescript");
        expect(sdks.targets.typescript.version).toBe("1.5.0");
        // local-file-system output should be simplified to just the path string
        expect(sdks.targets.typescript.output).toBe("./sdks/typescript");
    });

    // ── 2. TypeScript + Python SDK with npm/pypi publish ────────────────

    it("migrates a dual-SDK project with npm and pypi publishing", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "stripe-lite", version: "0.44.0" },
            generatorsYml: `api:
  specs:
    - openapi: ./openapi.yml
groups:
  typescript:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 3.59.2
        output:
          location: npm
          package-name: stripe-lite-sdk
        github:
          repository: stripe-lite/typescript-sdk
          mode: pull-request
        config:
          namespaceExport: StripeLite
  python:
    generators:
      - name: fernapi/fern-python-sdk
        version: 4.3.1
        output:
          location: pypi
          package-name: stripe-lite
        github:
          repository: stripe-lite/python-sdk
          mode: pull-request
        config:
          client_class_name: StripeLiteClient
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        expect(yml.org).toBe("stripe-lite");

        const sdks = yml.sdks as { targets: Record<string, Record<string, unknown>> };

        // TypeScript target
        expect(sdks.targets).toHaveProperty("typescript");
        const ts = sdks.targets.typescript;
        expect(ts.lang).toBe("typescript");
        expect(ts.version).toBe("3.59.2");
        expect(ts.publish).toBeDefined();
        const tsPublish = ts.publish as { npm: { packageName: string } };
        expect(tsPublish.npm.packageName).toBe("stripe-lite-sdk");
        expect(ts.config).toEqual({ namespaceExport: "StripeLite" });

        // Python target
        expect(sdks.targets).toHaveProperty("python");
        const py = sdks.targets.python;
        expect(py.lang).toBe("python");
        expect(py.version).toBe("4.3.1");
        expect(py.publish).toBeDefined();
        const pyPublish = py.publish as { pypi: { packageName: string } };
        expect(pyPublish.pypi.packageName).toBe("stripe-lite");
        expect(py.config).toEqual({ client_class_name: "StripeLiteClient" });

        // Git output should be present on both
        const tsOutput = ts.output as { git: { repository: string; mode: string } };
        expect(tsOutput.git.repository).toBe("stripe-lite/typescript-sdk");
        expect(tsOutput.git.mode).toBe("pr");
    });

    // ── 3. Multi-language SDK with all package managers ─────────────────

    it("migrates a project with all supported package manager outputs", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "megacorp", version: "0.44.0" },
            generatorsYml: `api:
  specs:
    - openapi: ./openapi.yml
groups:
  typescript:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 3.0.0
        output:
          location: npm
          package-name: megacorp
        github:
          repository: megacorp/ts-sdk
          mode: push
  python:
    generators:
      - name: fernapi/fern-python-sdk
        version: 4.0.0
        output:
          location: pypi
          package-name: megacorp
  java:
    generators:
      - name: fernapi/fern-java-sdk
        version: 2.0.0
        output:
          location: maven
          coordinate: com.megacorp:sdk
          username: \${MAVEN_USER}
          password: \${MAVEN_PASS}
  csharp:
    generators:
      - name: fernapi/fern-csharp-sdk
        version: 1.0.0
        output:
          location: nuget
          package-name: Megacorp.Sdk
  ruby:
    generators:
      - name: fernapi/fern-ruby-sdk
        version: 0.5.0
        output:
          location: rubygems
          package-name: megacorp
  rust:
    generators:
      - name: fernapi/fern-rust-sdk
        version: 0.3.0
        output:
          location: crates
          package-name: megacorp
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        const sdks = yml.sdks as { targets: Record<string, Record<string, unknown>> };

        // All 6 languages should have targets
        expect(Object.keys(sdks.targets)).toHaveLength(6);
        expect(sdks.targets).toHaveProperty("typescript");
        expect(sdks.targets).toHaveProperty("python");
        expect(sdks.targets).toHaveProperty("java");
        expect(sdks.targets).toHaveProperty("csharp");
        expect(sdks.targets).toHaveProperty("ruby");
        expect(sdks.targets).toHaveProperty("rust");

        // Each target should have publish config with the right registry
        expect((sdks.targets.typescript.publish as Record<string, unknown>).npm).toBeDefined();
        expect((sdks.targets.python.publish as Record<string, unknown>).pypi).toBeDefined();
        expect((sdks.targets.java.publish as Record<string, unknown>).maven).toBeDefined();
        expect((sdks.targets.csharp.publish as Record<string, unknown>).nuget).toBeDefined();
        expect((sdks.targets.ruby.publish as Record<string, unknown>).rubygems).toBeDefined();
        expect((sdks.targets.rust.publish as Record<string, unknown>).crates).toBeDefined();
    });

    // ── 4. Multi-API workspace (xAI-style: REST + gRPC) ────────────────

    it("migrates a multi-API workspace with REST and gRPC APIs", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "xai", version: "0.44.0" },
            apis: {
                rest: `api:
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
          repository: xai-org/xai-typescript
          mode: pull-request
        config:
          naming:
            namespace: xai
          generateWebSocketClients: true
  python:
    generators:
      - name: fernapi/fern-python-sdk
        version: 4.3.1
        output:
          location: pypi
          package-name: xai
        github:
          repository: xai-org/xai-python
          mode: pull-request
  rust:
    generators:
      - name: fernapi/fern-rust-sdk
        version: 0.26.6
        output:
          location: crates
          package-name: xai
        github:
          repository: xai-org/xai-rust
          mode: pull-request
        config:
          clientClassName: XaiClient
          crateName: xai
`,
                grpc: `api:
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
          repository: xai-org/xai-dotnet
          mode: pull-request
        config:
          namespace: Xai
          client-class-name: XaiClient
  java:
    generators:
      - name: fernapi/fern-java-sdk
        version: 2.10.0
        output:
          location: maven
          coordinate: com.xai:sdk
        github:
          repository: xai-org/xai-java
          mode: pull-request
`
            }
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        expect(yml.org).toBe("xai");

        // Should use `apis` (multi-API), not `api`
        expect(yml.apis).toBeDefined();
        expect(yml.api).toBeUndefined();

        const apis = yml.apis as Record<string, unknown>;
        expect(apis).toHaveProperty("rest");
        expect(apis).toHaveProperty("grpc");

        // SDK targets from both APIs, suffixed with API name
        const sdks = yml.sdks as { targets: Record<string, Record<string, unknown>>; autorelease: boolean };
        expect(sdks.targets).toHaveProperty("typescript-rest");
        expect(sdks.targets).toHaveProperty("python-rest");
        expect(sdks.targets).toHaveProperty("rust-rest");
        expect(sdks.targets).toHaveProperty("csharp-grpc");
        expect(sdks.targets).toHaveProperty("java-grpc");

        // Each target should have the correct api field
        expect(sdks.targets["typescript-rest"].api).toBe("rest");
        expect(sdks.targets["csharp-grpc"].api).toBe("grpc");

        // Autorelease should be preserved
        expect(sdks.autorelease).toBe(false);
    });

    // ── 5. Project with docs.yml (Twilio-style) ────────────────────────

    it("migrates a project with docs.yml and emits $ref pointer", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "twilio-clone", version: "0.44.0" },
            generatorsYml: `api:
  specs:
    - openapi: ./openapi.yml
groups:
  typescript:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 3.50.0
        output:
          location: npm
          package-name: twilio-clone
        github:
          repository: twilio-clone/node-sdk
          mode: push
`,
            docsYml: `instances:
  - url: twilio-clone.docs.buildwithfern.com
    custom-domain: docs.twilio-clone.com
title: Twilio Clone API Docs
logo:
  dark: ./images/logo-dark.png
  light: ./images/logo-light.png
colors:
  accentPrimary: "#F22F46"
navigation:
  - section: Getting Started
    contents:
      - page: Introduction
        path: ./pages/introduction.mdx
      - page: Authentication
        path: ./pages/auth.mdx
  - api: API Reference
tabs:
  api:
    display-name: API
    icon: code
  changelog:
    display-name: Changelog
    icon: clock
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const raw = await readMigratedYmlRaw(projectDir);
        // Should contain $ref pointer, not inlined content
        expect(raw).toContain("$ref: ./docs.yml");
        expect(raw).not.toContain("instances:");
        expect(raw).not.toContain("Twilio Clone API Docs");
        expect(raw).not.toContain("navigation:");
        expect(raw).not.toContain("tabs:");

        // docs.yml should remain untouched
        const docsContent = await readFile(join(projectDir, "fern", "docs.yml"), "utf-8");
        expect(docsContent).toContain("twilio-clone.docs.buildwithfern.com");
    });

    // ── 6. Project with GitHub workflows ───────────────────────────────

    it("migrates GitHub workflow files alongside fern.yml", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "acme", version: "0.44.0" },
            generatorsYml: `groups:
  sdk:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 1.0.0
        output:
          location: local-file-system
          path: ./sdks/ts
`,
            workflows: {
                "generate.yml": `name: Generate SDKs
on:
  push:
    branches: [main]
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Fern
        run: npm install -g fern-api
      - name: Generate TypeScript SDK
        run: fern generate --group typescript
      - name: Generate Python SDK
        run: fern generate --group python
`,
                "ci.yml": `name: CI
on: pull_request
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test
`
            }
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        // generate.yml should be migrated
        const generateContent = await readFile(join(projectDir, ".github", "workflows", "generate.yml"), "utf-8");
        expect(generateContent).toContain("fern sdk generate --target typescript");
        expect(generateContent).toContain("fern sdk generate --target python");
        expect(generateContent).not.toContain("fern generate --group");

        // ci.yml should be untouched (no fern commands)
        const ciContent = await readFile(join(projectDir, ".github", "workflows", "ci.yml"), "utf-8");
        expect(ciContent).not.toContain("fern sdk generate");
        expect(ciContent).toContain("npm test");
    });

    // ── 7. Full-stack project: multi-API + docs + workflows ─────────────

    it("migrates a full-stack project with multi-API, docs, and workflows", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "fullstack-co", version: "0.44.0" },
            apis: {
                public: `api:
  specs:
    - openapi: ./openapi.yml
groups:
  typescript:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 3.50.0
        output:
          location: npm
          package-name: "@fullstack-co/public-sdk"
        github:
          repository: fullstack-co/public-ts-sdk
          mode: push
`,
                internal: `api:
  specs:
    - openapi: ./internal-api.yml
groups:
  python:
    generators:
      - name: fernapi/fern-python-sdk
        version: 4.0.0
        output:
          location: pypi
          package-name: fullstack-internal
        github:
          repository: fullstack-co/internal-py-sdk
          mode: pull-request
`
            },
            docsYml: `instances:
  - url: fullstack-co.docs.buildwithfern.com
title: Fullstack Co API
navigation:
  - api: Public API
  - api: Internal API
`,
            workflows: {
                "publish-sdks.yml": `name: Publish SDKs
on:
  push:
    branches: [main]
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g fern-api
      - run: fern generate --group typescript
      - run: fern generate --group python
`
            }
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);

        // Multi-API
        expect(yml.apis).toBeDefined();
        const apis = yml.apis as Record<string, unknown>;
        expect(apis).toHaveProperty("public");
        expect(apis).toHaveProperty("internal");

        // SDK targets with API suffix
        const sdks = yml.sdks as { targets: Record<string, Record<string, unknown>> };
        expect(sdks.targets).toHaveProperty("typescript-public");
        expect(sdks.targets).toHaveProperty("python-internal");
        expect(sdks.targets["typescript-public"].api).toBe("public");
        expect(sdks.targets["python-internal"].api).toBe("internal");

        // Docs $ref pointer
        const raw = await readMigratedYmlRaw(projectDir);
        expect(raw).toContain("$ref: ./docs.yml");

        // Workflows migrated
        const workflowContent = await readFile(join(projectDir, ".github", "workflows", "publish-sdks.yml"), "utf-8");
        expect(workflowContent).toContain("fern sdk generate --target typescript");
        expect(workflowContent).toContain("fern sdk generate --target python");
    });

    // ── 8. Project with default-group (should be dropped) ──────────────

    it("drops defaultGroup and group from migrated output", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "grouped-co", version: "0.44.0" },
            generatorsYml: `default-group: production
groups:
  staging:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 1.0.0
        output:
          location: local-file-system
          path: ./ts-staging
  production:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 1.0.0
        output:
          location: npm
          package-name: grouped-co
        github:
          repository: grouped-co/ts-sdk
          mode: push
      - name: fernapi/fern-python-sdk
        version: 2.0.0
        output:
          location: pypi
          package-name: grouped-co
        github:
          repository: grouped-co/py-sdk
          mode: push
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const raw = await readMigratedYmlRaw(projectDir);
        expect(raw).not.toContain("defaultGroup");
        expect(raw).not.toContain("default-group");

        const yml = await readMigratedYml(projectDir);
        const sdks = yml.sdks as { targets: Record<string, Record<string, unknown>> };

        // No target should have a "group" field
        for (const target of Object.values(sdks.targets)) {
            expect(target).not.toHaveProperty("group");
            expect(target).not.toHaveProperty("defaultGroup");
        }

        // Should have two typescript targets (deduped with count) and one python
        const targetNames = Object.keys(sdks.targets);
        expect(targetNames).toContain("typescript");
        expect(targetNames).toContain("typescript-2");
        expect(targetNames).toContain("python");
    });

    // ── 9. Project with OpenAPI + overrides + AsyncAPI specs ────────────

    it("correctly converts API specs with overrides and asyncapi", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "specful-co", version: "0.44.0" },
            generatorsYml: `api:
  specs:
    - openapi: ./openapi/main.yml
      overrides: ./openapi/overrides.yml
    - openapi: ./openapi/admin.yml
    - asyncapi: ./events/asyncapi.yml
groups:
  sdk:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 3.0.0
        output:
          location: local-file-system
          path: ./sdks/ts
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        expect(yml.api).toBeDefined();

        const api = yml.api as { specs: Array<Record<string, unknown>> };
        expect(api.specs).toHaveLength(3);

        // First spec should have openapi + overrides
        const first = api.specs[0];
        expect(first.openapi).toBeDefined();
        expect(first.overrides).toBeDefined();

        // Second spec should have openapi only
        const second = api.specs[1];
        expect(second.openapi).toBeDefined();
        expect(second.overrides).toBeUndefined();

        // Third spec should be asyncapi
        const third = api.specs[2];
        expect(third.asyncapi).toBeDefined();
    });

    // ── 10. Project with autorelease enabled ────────────────────────────

    it("preserves autorelease setting in migrated output", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "auto-co", version: "0.44.0" },
            generatorsYml: `autorelease: true
api:
  specs:
    - openapi: ./openapi.yml
groups:
  typescript:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 3.0.0
        output:
          location: npm
          package-name: auto-co
        github:
          repository: auto-co/ts-sdk
          mode: push
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        const sdks = yml.sdks as { autorelease: boolean; targets: Record<string, unknown> };
        expect(sdks.autorelease).toBe(true);
    });

    // ── 11. Project with metadata and license ────────────────────────────

    it("migrates generator metadata fields correctly", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "meta-co", version: "0.44.0" },
            generatorsYml: `groups:
  sdk:
    generators:
      - name: fernapi/fern-python-sdk
        version: 4.0.0
        output:
          location: pypi
          package-name: meta-co
        github:
          repository: meta-co/py-sdk
          mode: push
        metadata:
          package-description: "Official Meta Co Python SDK"
          author: "Meta Co"
          email: "sdk@meta.co"
          license: MIT
          reference-url: "https://docs.meta.co"
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        const sdks = yml.sdks as { targets: Record<string, Record<string, unknown>> };
        const target = sdks.targets.python;

        // metadata fields should be migrated
        const metadata = target.metadata as { description: string; authors: Array<{ name: string; email: string }> };
        expect(metadata.description).toBe("Official Meta Co Python SDK");
        expect(metadata.authors).toEqual([{ name: "Meta Co", email: "sdk@meta.co" }]);

        // license should be on output.git
        const output = target.output as { git: { license: string } };
        expect(output.git.license).toBe("MIT");

        // reference-url should generate an unsupported warning
        expect(result.warnings.some((w) => w.message.includes("reference-url"))).toBe(true);
    });

    // ── 12. Project with smart-casing (should warn) ─────────────────────

    it("warns about unsupported smart-casing configuration", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "casing-co", version: "0.44.0" },
            generatorsYml: `groups:
  sdk:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 3.0.0
        smart-casing: true
        output:
          location: local-file-system
          path: ./sdks/ts
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        // Should warn about smart-casing
        expect(result.warnings.some((w) => w.message.includes("smart-casing"))).toBe(true);
    });

    // ── 13. Project with OpenAPI settings (titleAsSchemaName etc.) ──────

    it("migrates a project with openapi settings in api config", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "settings-co", version: "0.44.0" },
            generatorsYml: `api:
  specs:
    - openapi: ./openapi.yml
  settings:
    unions: v1
    message-naming: v2
    title-as-schema-name: true
groups:
  sdk:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 3.0.0
        output:
          location: local-file-system
          path: ./sdks/ts
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        expect(yml.api).toBeDefined();

        const api = yml.api as { settings?: Record<string, unknown> };
        if (api.settings != null) {
            // Settings should be preserved
            expect(api.settings).toBeDefined();
        }
    });

    // ── 14. Project with fern-api/ prefix in workflow ───────────────────

    it("handles fern-api variant commands in workflows", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "prefix-co", version: "0.44.0" },
            generatorsYml: `groups:
  sdk:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 1.0.0
        output:
          location: local-file-system
          path: ./sdks/ts
`,
            workflows: {
                "deploy.yml": `name: Deploy
on: push
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx fern-api generate --group production
      - run: npx fern-api generate
`
            }
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const workflowContent = await readFile(join(projectDir, ".github", "workflows", "deploy.yml"), "utf-8");
        // fern-api generate should become fern-api sdk generate
        expect(workflowContent).toContain("fern-api sdk generate --target production");
        expect(workflowContent).toContain("fern-api sdk generate");
        expect(workflowContent).not.toContain("fern-api generate --group");
    });

    // ── 15. Empty groups (minimal project, no generators) ───────────────

    it("handles empty groups gracefully", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "empty-co", version: "0.44.0" },
            generatorsYml: `groups: {}
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        expect(yml.org).toBe("empty-co");
        // Should either have empty sdks or no sdks key
        const sdks = yml.sdks as { targets: Record<string, unknown> } | undefined;
        if (sdks != null) {
            expect(Object.keys(sdks.targets)).toHaveLength(0);
        }
    });

    // ── 16. Project with multiple generators in one group ───────────────

    it("creates separate targets for multiple generators in the same group", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "multi-gen", version: "0.44.0" },
            generatorsYml: `groups:
  all:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 3.0.0
        output:
          location: local-file-system
          path: ./sdks/ts
      - name: fernapi/fern-python-sdk
        version: 4.0.0
        output:
          location: local-file-system
          path: ./sdks/py
      - name: fernapi/fern-go-sdk
        version: 1.0.0
        output:
          location: local-file-system
          path: ./sdks/go
      - name: fernapi/fern-java-sdk
        version: 2.0.0
        output:
          location: local-file-system
          path: ./sdks/java
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        const sdks = yml.sdks as { targets: Record<string, Record<string, unknown>> };

        expect(Object.keys(sdks.targets)).toHaveLength(4);
        expect(sdks.targets).toHaveProperty("typescript");
        expect(sdks.targets).toHaveProperty("python");
        expect(sdks.targets).toHaveProperty("go");
        expect(sdks.targets).toHaveProperty("java");

        // Each should have correct lang
        expect(sdks.targets.typescript.lang).toBe("typescript");
        expect(sdks.targets.python.lang).toBe("python");
        expect(sdks.targets.go.lang).toBe("go");
        expect(sdks.targets.java.lang).toBe("java");

        // All should have simplified local output paths
        expect(sdks.targets.typescript.output).toBe("./sdks/ts");
        expect(sdks.targets.python.output).toBe("./sdks/py");
        expect(sdks.targets.go.output).toBe("./sdks/go");
        expect(sdks.targets.java.output).toBe("./sdks/java");
    });

    // ── 17. Project with git push mode and branch config ────────────────

    it("preserves git output branch and mode settings", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "git-co", version: "0.44.0" },
            generatorsYml: `groups:
  sdk:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 3.0.0
        output:
          location: npm
          package-name: git-co
        github:
          repository: git-co/ts-sdk
          mode: push
          branch: generated/main
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        const sdks = yml.sdks as { targets: Record<string, Record<string, unknown>> };
        const output = sdks.targets.typescript.output as { git: { repository: string; mode: string; branch: string } };

        expect(output.git.repository).toBe("git-co/ts-sdk");
        expect(output.git.mode).toBe("push");
        expect(output.git.branch).toBe("generated/main");
    });

    // ── 18. Project with deprecated top-level openapi/async-api keys ────

    it("warns about deprecated top-level openapi key", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "deprecated-co", version: "0.44.0" },
            generatorsYml: `openapi: ./openapi.yml
groups:
  sdk:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 1.0.0
        output:
          location: local-file-system
          path: ./sdks/ts
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);
        expect(result.warnings.some((w) => w.message.toLowerCase().includes("openapi"))).toBe(true);
    });

    // ── 19. Proto-based API project ─────────────────────────────────────

    it("migrates a proto-based API configuration", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "proto-co", version: "0.44.0" },
            generatorsYml: `api:
  specs:
    - proto:
        root: ./proto
        overrides: ./overrides.yml
        from-openapi: true
        local-generation: true
groups:
  go:
    generators:
      - name: fernapi/fern-go-sdk
        version: 1.5.0
        output:
          location: local-file-system
          path: ./sdks/go
        config:
          packageName: protoco
          module:
            path: github.com/proto-co/go-sdk
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        expect(yml.api).toBeDefined();

        const api = yml.api as { specs: Array<{ proto: Record<string, unknown> }> };
        expect(api.specs[0].proto).toBeDefined();
        expect(api.specs[0].proto.root).toBe("./proto");

        const sdks = yml.sdks as { targets: Record<string, Record<string, unknown>> };
        expect(sdks.targets).toHaveProperty("go");
        expect(sdks.targets.go.config).toEqual({
            packageName: "protoco",
            module: { path: "github.com/proto-co/go-sdk" }
        });
    });

    // ── 20. Project with Swift and PHP SDKs ─────────────────────────────

    it("migrates Swift and PHP SDK configurations", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "mobile-co", version: "0.44.0" },
            generatorsYml: `api:
  specs:
    - openapi: ./openapi.yml
groups:
  swift:
    generators:
      - name: fernapi/fern-swift-sdk
        version: 0.10.0
        output:
          location: local-file-system
          path: ./sdks/swift
        github:
          repository: mobile-co/swift-sdk
          mode: push
        config:
          clientName: MobileCoClient
  php:
    generators:
      - name: fernapi/fern-php-sdk
        version: 1.2.0
        output:
          location: local-file-system
          path: ./sdks/php
        github:
          repository: mobile-co/php-sdk
          mode: push
        config:
          namespace: MobileCo
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        const sdks = yml.sdks as { targets: Record<string, Record<string, unknown>> };

        expect(sdks.targets).toHaveProperty("swift");
        expect(sdks.targets.swift.lang).toBe("swift");
        expect(sdks.targets.swift.config).toEqual({ clientName: "MobileCoClient" });

        expect(sdks.targets).toHaveProperty("php");
        expect(sdks.targets.php.lang).toBe("php");
        expect(sdks.targets.php.config).toEqual({ namespace: "MobileCo" });
    });

    // ── 21. Multi-API with docs and no generators in one API ────────────

    it("handles multi-API where one API has no generators", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "partial-co", version: "0.44.0" },
            apis: {
                main: `api:
  specs:
    - openapi: ./openapi.yml
groups:
  typescript:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 3.0.0
        output:
          location: local-file-system
          path: ./sdks/ts
`,
                experimental: `api:
  specs:
    - openapi: ./experimental.yml
groups: {}
`
            },
            docsYml: `instances:
  - url: partial-co.docs.buildwithfern.com
title: Partial Co
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        expect(yml.apis).toBeDefined();
        const apis = yml.apis as Record<string, unknown>;
        expect(apis).toHaveProperty("main");
        expect(apis).toHaveProperty("experimental");

        // Only main API should have SDK targets
        const sdks = yml.sdks as { targets: Record<string, Record<string, unknown>> } | undefined;
        if (sdks != null) {
            const targetNames = Object.keys(sdks.targets);
            expect(targetNames.some((n) => n.includes("main"))).toBe(true);
            expect(targetNames.some((n) => n.includes("experimental"))).toBe(false);
        }

        // Docs $ref
        const raw = await readMigratedYmlRaw(projectDir);
        expect(raw).toContain("$ref: ./docs.yml");
    });

    // ── 22. Project with complex workflow (multiple fern commands) ──────

    it("migrates workflows with multiple fern generate commands", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "workflow-co", version: "0.44.0" },
            generatorsYml: `groups: {}
`,
            workflows: {
                "multi-step.yml": `name: Multi-step
on:
  push:
    branches: [main]
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g fern-api
      - name: Generate TypeScript
        run: fern generate --group ts-sdk --log-level debug
      - name: Generate Python
        run: fern generate --group py-sdk
      - name: Generate Go
        run: fern generate --group go-sdk
      - name: Check
        run: fern check
`
            }
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const workflowContent = await readFile(join(projectDir, ".github", "workflows", "multi-step.yml"), "utf-8");

        // All fern generate --group X should be migrated
        expect(workflowContent).toContain("fern sdk generate --target ts-sdk --log-level debug");
        expect(workflowContent).toContain("fern sdk generate --target py-sdk");
        expect(workflowContent).toContain("fern sdk generate --target go-sdk");
        // fern check should remain untouched
        expect(workflowContent).toContain("fern check");
        expect(workflowContent).not.toContain("fern generate --group");
    });

    // ── 23. Project with maven signing config ───────────────────────────

    it("migrates maven output with signature configuration", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "java-co", version: "0.44.0" },
            generatorsYml: `api:
  specs:
    - openapi: ./openapi.yml
groups:
  java:
    generators:
      - name: fernapi/fern-java-sdk
        version: 2.0.0
        output:
          location: maven
          coordinate: com.java-co:sdk
          url: https://s01.oss.sonatype.org/content/repositories/releases/
          username: \${MAVEN_USERNAME}
          password: \${MAVEN_PASSWORD}
          signature:
            keyId: \${GPG_KEY_ID}
            password: \${GPG_PASSWORD}
            secretKey: \${GPG_SECRET_KEY}
        github:
          repository: java-co/java-sdk
          mode: push
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        const sdks = yml.sdks as { targets: Record<string, Record<string, unknown>> };
        const target = sdks.targets.java;

        expect(target.lang).toBe("java");
        const publish = target.publish as { maven: { coordinate: string; signature?: Record<string, unknown> } };
        expect(publish.maven.coordinate).toBe("com.java-co:sdk");
        expect(publish.maven.signature).toBeDefined();
    });

    // ── 24. Large multi-API project (3+ APIs) ───────────────────────────

    it("migrates a large project with 3+ API directories", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "enterprise", version: "0.44.0" },
            apis: {
                users: `api:
  specs:
    - openapi: ./users-api.yml
groups:
  typescript:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 3.0.0
        output:
          location: local-file-system
          path: ./sdks/ts-users
`,
                billing: `api:
  specs:
    - openapi: ./billing-api.yml
groups:
  typescript:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 3.0.0
        output:
          location: local-file-system
          path: ./sdks/ts-billing
  python:
    generators:
      - name: fernapi/fern-python-sdk
        version: 4.0.0
        output:
          location: local-file-system
          path: ./sdks/py-billing
`,
                analytics: `api:
  specs:
    - openapi: ./analytics-api.yml
groups:
  go:
    generators:
      - name: fernapi/fern-go-sdk
        version: 1.0.0
        output:
          location: local-file-system
          path: ./sdks/go-analytics
`
            }
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        const apis = yml.apis as Record<string, unknown>;
        expect(Object.keys(apis)).toHaveLength(3);

        const sdks = yml.sdks as { targets: Record<string, Record<string, unknown>> };
        expect(sdks.targets).toHaveProperty("typescript-users");
        expect(sdks.targets).toHaveProperty("typescript-billing");
        expect(sdks.targets).toHaveProperty("python-billing");
        expect(sdks.targets).toHaveProperty("go-analytics");
        expect(Object.keys(sdks.targets)).toHaveLength(4);
    });

    // ── 25. Project with Fern definition (no openapi spec) ──────────────

    it("migrates a project using Fern definition files (no OpenAPI)", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "ferndef-co", version: "0.44.0" },
            generatorsYml: `groups:
  typescript:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 3.0.0
        output:
          location: local-file-system
          path: ./sdks/ts
`
        });

        // Create definition directory to simulate Fern definition project
        await mkdir(join(projectDir, "fern", "definition"), { recursive: true });
        await writeFile(join(projectDir, "fern", "definition", "api.yml"), "name: ferndef-co\n");

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        expect(yml.org).toBe("ferndef-co");
        expect(yml.sdks).toBeDefined();
    });
});
