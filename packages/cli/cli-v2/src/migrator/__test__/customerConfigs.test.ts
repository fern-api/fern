/**
 * Customer config migration tests.
 *
 * Each test uses REAL configuration files sourced from the fern-demo GitHub
 * organization (https://github.com/fern-demo).  The generators.yml and
 * fern.config.json payloads are copied verbatim (or with minor redactions of
 * tokens) so the test suite exercises the migrator against actual customer
 * setups rather than synthetic fixtures.
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
    fernConfig: { organization: string; version: string };
    generatorsYml?: string;
    apis?: Record<string, string>;
    docsYml?: string;
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
// Real customer config collection  (sourced from fern-demo GitHub org)
// ---------------------------------------------------------------------------

describe("Customer config migrations (fern-demo)", () => {
    let base: string;

    beforeEach(async () => {
        base = join(tmpdir(), `customer-configs-${randomUUID()}`);
        await mkdir(base, { recursive: true });
    });

    afterEach(async () => {
        await rm(base, { recursive: true, force: true });
    });

    // -- 1. Intercom -- multi-SDK (TS/Java/Python), smart-casing, OpenAPI settings
    // Source: fern-demo/intercom-fern-config

    it("migrates the Intercom config (TS + Java + Python, smart-casing)", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "intercom", version: "0.117.0" },
            generatorsYml: `api:
  specs:
    - openapi: ../openapi.yml
      overrides: ../openapi-overrides.yml
      settings:
        title-as-schema-name: false
        inline-path-parameters: true

groups:
  ts-sdk:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 0.44.3
        output:
          location: npm
          package-name: intercom-sdk
          token: \${NPM_TOKEN}
        github:
          repository: fern-demo/intercom-typescript
          mode: pull-request
        config:
          namespaceExport: Intercom
          allowCustomFetcher: true
          skipResponseValidation: true
          includeApiReference: true
          noSerdeLayer: true
          enableInlineTypes: true
          inlinePathParameters: true
        smart-casing: true
  java-sdk:
    generators:
      - name: fernapi/fern-java-sdk
        version: 2.11.0
        github:
          repository: fern-demo/intercom-java-sdk
        config:
          enable-inline-types: true
          client-class-name: Intercom
          inline-path-parameters: true
  python-sdk:
    generators:
      - name: fernapi/fern-python-sdk
        version: 3.10.6
        github:
          repository: fern-demo/intercom-python-sdk
        config:
          client_class_name: Intercom
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        expect(yml.org).toBe("intercom");

        const sdks = yml.sdks as { targets: Record<string, Record<string, unknown>> };
        expect(sdks.targets).toHaveProperty("typescript");
        expect(sdks.targets).toHaveProperty("java");
        expect(sdks.targets).toHaveProperty("python");

        const ts = sdks.targets["typescript"] as Record<string, unknown>;
        expect(ts.lang).toBe("typescript");
        expect(ts.version).toBe("0.44.3");
        const tsPublish = ts.publish as { npm: { packageName: string } };
        expect(tsPublish.npm.packageName).toBe("intercom-sdk");
        expect(ts.config).toBeDefined();

        const java = sdks.targets["java"] as Record<string, unknown>;
        expect(java.lang).toBe("java");
        expect(java.version).toBe("2.11.0");

        const py = sdks.targets["python"] as Record<string, unknown>;
        expect(py.lang).toBe("python");
        expect(py.version).toBe("3.10.6");

        const raw = await readMigratedYmlRaw(projectDir);
        expect(raw).not.toContain("defaultGroup");
        expect(raw).not.toMatch(/^group:/m);
    });

    // -- 2. Sayari -- default-group, many generator groups
    // Source: fern-demo/sayari-fern-spec

    it("migrates the Sayari config (default-group, Go/Python/Java/TS)", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "sayari-analytics", version: "0.117.0" },
            generatorsYml: `default-group: all
groups:
  python-cloud:
    generators:
      - name: fernapi/fern-python-sdk
        version: 1.4.0-rc3
        output:
          location: pypi
          package-name: "sayari"
          token: ""
        github:
          repository: "fern-demo/sayari-python"
          mode: pull-request
        config:
          package_name: sayari
          client_class_name: "Sayari"
          improved_imports: true
          pydantic_config:
            use_str_enums: true
  go:
    generators:
      - name: fernapi/fern-go-sdk
        version: 9.0.2
        config:
          importPath: github.com/sayari-analytics/sayari-go/generated/go
        output:
          location: local-file-system
          path: ../generated/go
  python:
    generators:
      - name: fernapi/fern-python-sdk
        version: 9.0.5
        output:
          location: local-file-system
          path: ../generated/python
  postman:
    generators:
      - name: fernapi/fern-postman
        version: 0.1.1-rc0
        output:
          location: local-file-system
          path: ../generated/postman
  openapi:
    generators:
      - name: fernapi/fern-openapi
        version: 0.0.28
        output:
          location: local-file-system
          path: ../generated/openapi
  java:
    generators:
      - name: fernapi/fern-java-sdk
        version: 0.6.1
        output:
          location: local-file-system
          path: ../generated/java
        config:
          packagePrefix: com.sayari.sdk
          mode: client
  node:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 0.9.0
        config:
          outputSourceFiles: true
        output:
          location: local-file-system
          path: ../generated/node
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        expect(yml.org).toBe("sayari-analytics");

        const sdks = yml.sdks as { targets: Record<string, Record<string, unknown>> };

        expect(sdks.targets).toHaveProperty("go");
        const go = sdks.targets["go"] as Record<string, unknown>;
        expect(go.lang).toBe("go");
        expect(go.output).toBe("../generated/go");

        expect(sdks.targets).toHaveProperty("java");
        expect((sdks.targets["java"] as Record<string, unknown>).lang).toBe("java");

        expect(sdks.targets).toHaveProperty("typescript");
        expect((sdks.targets["typescript"] as Record<string, unknown>).lang).toBe("typescript");

        const raw = await readMigratedYmlRaw(projectDir);
        expect(raw).not.toContain("default-group");
        expect(raw).not.toContain("defaultGroup");
    });

    // -- 3. Webflow -- TS + Python with npm/pypi, git branch config
    // Source: fern-demo/webflow-config

    it("migrates the Webflow config (TS npm + Python pypi, git branch)", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "webflow", version: "0.117.0" },
            generatorsYml: `openapi: ../specs/v2.yml
groups:
  js-sdk:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 0.9.4
        output:
          location: npm
          token: \${NPM_TOKEN}
          package-name: webflow-api
        config:
          namespaceExport: Webflow
          skipResponseValidation: true
        github:
          mode: push
          repository: webflow/js-webflow-api
          branch: 2.0.0-beta.0

  python-sdk:
    generators:
      - name: fernapi/fern-python-sdk
        version: 0.6.5
        output:
          location: pypi
          token: \${PYPI_TOKEN}
          package-name: webflow
        config:
          client_class_name: Webflow
        github:
          repository: webflow/webflow-python
          mode: pull-request
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        expect(yml.org).toBe("webflow");

        const sdks = yml.sdks as { targets: Record<string, Record<string, unknown>> };

        expect(sdks.targets).toHaveProperty("typescript");
        const ts = sdks.targets["typescript"] as Record<string, unknown>;
        expect(ts.lang).toBe("typescript");
        expect(ts.version).toBe("0.9.4");
        const tsPublish = ts.publish as { npm: { packageName: string } };
        expect(tsPublish.npm.packageName).toBe("webflow-api");

        const tsOutput = ts.output as { git: { repository: string; branch: string; mode: string } };
        expect(tsOutput.git.repository).toBe("webflow/js-webflow-api");
        expect(tsOutput.git.branch).toBe("2.0.0-beta.0");
        expect(tsOutput.git.mode).toBe("push");

        expect(sdks.targets).toHaveProperty("python");
        const py = sdks.targets["python"] as Record<string, unknown>;
        expect(py.lang).toBe("python");
        const pyPublish = py.publish as { pypi: { packageName: string } };
        expect(pyPublish.pypi.packageName).toBe("webflow");
    });

    // -- 4. Carbon AI -- deprecated top-level openapi key, smart-casing
    // Source: fern-demo/carbon-config

    it("migrates the Carbon AI config (deprecated openapi key, smart-casing)", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "carbon-ai", version: "0.117.0" },
            generatorsYml: `openapi: ../openapi.yml
openapi-overrides: ../openapi-overrides.yml
groups:
  ts-sdk:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 0.11.4-rc2
        github:
          repository: fern-demo/carbon-typescript
        config:
          namespaceExport: Carbon
          skipResponseValidation: true
          includeApiReference: true
        smart-casing: true
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        expect(yml.org).toBe("carbon-ai");

        const sdks = yml.sdks as { targets: Record<string, Record<string, unknown>> };
        expect(sdks.targets).toHaveProperty("typescript");
        const ts = sdks.targets["typescript"] as Record<string, unknown>;
        expect(ts.lang).toBe("typescript");
        expect(ts.version).toBe("0.11.4-rc2");
        expect(ts.config).toBeDefined();

        const raw = await readMigratedYmlRaw(projectDir);
        expect(raw).not.toMatch(/^group:/m);
    });

    // -- 5. Datastax (Astrapy) -- Python SDK with pydantic config, pypi
    // Source: fern-demo/datastax-api

    it("migrates the Datastax/Astrapy config (Python SDK, pydantic config, pypi)", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "astrapy", version: "0.117.0" },
            generatorsYml: `groups:
  py-sdk:
    generators:
      - name: fernapi/fern-python-sdk
        version: 0.11.9
        config:
          improved_imports: true
          pydantic_config:
            use_str_enums: true
          package_name: astrapy
          client:
            class_name: BaseAstraDB
            filename: base_client.py
            exported_class_name: AstraDB
            exported_filename: client.py
        output:
          location: pypi
          package-name: astrapy
          token: \${PYPI_TOKEN}
        github:
          repository: "fern-demo/astrapy"
          mode: pull-request
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        expect(yml.org).toBe("astrapy");

        const sdks = yml.sdks as { targets: Record<string, Record<string, unknown>> };
        expect(sdks.targets).toHaveProperty("python");
        const py = sdks.targets["python"] as Record<string, unknown>;
        expect(py.lang).toBe("python");
        expect(py.version).toBe("0.11.9");

        const pyPublish = py.publish as { pypi: { packageName: string } };
        expect(pyPublish.pypi.packageName).toBe("astrapy");

        const config = py.config as Record<string, unknown>;
        expect(config.improved_imports).toBe(true);
        expect(config.pydantic_config).toEqual({ use_str_enums: true });
        expect(config.client).toEqual({
            class_name: "BaseAstraDB",
            filename: "base_client.py",
            exported_class_name: "AstraDB",
            exported_filename: "client.py"
        });
    });

    // -- 6. Intrinsic -- Ruby SDK + FastAPI server, audiences, with docs.yml
    // Source: fern-demo/intrinsic-api

    it("migrates the Intrinsic config (Ruby SDK, docs.yml $ref pointer)", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "intrinsic", version: "0.117.0" },
            generatorsYml: `groups:
  public:
    audiences:
      - public
    generators:
      - name: fernapi/fern-fastapi-server
        version: 1.0.0-rc1
        output:
          location: local-file-system
          path: ../src/python/hopper/api/generated
        config:
          async_handlers: true
  internal:
    audiences:
      - public
      - internal
    generators:
      - name: fernapi/fern-fastapi-server
        version: 1.0.0-rc1
        output:
          location: local-file-system
          path: ../src/python/hopper/api/generated
        config:
          async_handlers: true
  hopper:
    audiences:
      - hopper
    generators:
      - name: fernapi/fern-fastapi-server
        version: 1.0.0-rc1
        output:
          location: local-file-system
          path: ../src/python/hopper/api/generated
        config:
          async_handlers: true
  ruby-sdk:
    audiences:
      - public
    generators:
      - name: fernapi/fern-ruby-sdk
        version: 0.1.0-rc0
        github:
          repository: fern-demo/intrinsic-ruby
        config:
          clientClassName: Intrinsic
`,
            docsYml: `instances:
  - url: intrinsic.docs.buildwithfern.com
    custom-domain: docs.intrinsicapi.com

title: Intrinsic | Docs

navigation:
  - section: Getting started
    contents:
      - page: Welcome
        path: ./docs/pages/welcome.mdx
      - page: Quickstart
        path: ./docs/pages/quickstart.mdx
  - api: API Reference
    audiences:
      - public

navbar-links:
  - type: primary
    text: Contact us
    url: "mailto:support@withintrinsic.com"

colors:
  accentPrimary:
    dark: "#18ed9d"
    light: "#13A06C"

logo:
  dark: ./docs/assets/logo_white.png
  light: ./docs/assets/logo_black.png
  height: 25

favicon: ./docs/assets/favicon.png
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        expect(yml.org).toBe("intrinsic");

        const raw = await readMigratedYmlRaw(projectDir);
        expect(raw).toContain("$ref: ./docs.yml");
        expect(raw).not.toContain("intrinsic.docs.buildwithfern.com");
        expect(raw).not.toContain("favicon");

        const docsContent = await readFile(join(projectDir, "fern", "docs.yml"), "utf-8");
        expect(docsContent).toContain("intrinsic.docs.buildwithfern.com");
        expect(docsContent).toContain("docs.intrinsicapi.com");

        const sdks = yml.sdks as { targets: Record<string, Record<string, unknown>> };
        expect(sdks.targets).toHaveProperty("ruby");
        const ruby = sdks.targets["ruby"] as Record<string, unknown>;
        expect(ruby.lang).toBe("ruby");
        expect(ruby.version).toBe("0.1.0-rc0");
    });

    // -- 7. MongoDB -- Go SDK with smart-casing, deprecated openapi object
    // Source: fern-demo/mongo-config

    it("migrates the MongoDB config (Go SDK, smart-casing, openapi object)", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "mongodb", version: "0.117.0" },
            generatorsYml: `openapi:
  path: ../openapi.yml
  disable-examples: true
groups:
  go-sdk:
    generators:
      - name: fernapi/fern-go-sdk
        version: 0.18.0
        config:
          packageName: mongodb
          union: v1
          module:
            version: "1.18"
        smart-casing: true
        github:
          repository: fern-demo/mongodb-atlas-go
          mode: pull-request
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        expect(yml.org).toBe("mongodb");

        const sdks = yml.sdks as { targets: Record<string, Record<string, unknown>> };
        expect(sdks.targets).toHaveProperty("go");
        const go = sdks.targets["go"] as Record<string, unknown>;
        expect(go.lang).toBe("go");
        expect(go.version).toBe("0.18.0");

        const config = go.config as Record<string, unknown>;
        expect(config.packageName).toBe("mongodb");

        const goOutput = go.output as { git: { repository: string; mode: string } };
        expect(goOutput.git.repository).toBe("fern-demo/mongodb-atlas-go");
        expect(goOutput.git.mode).toBe("pr");
    });

    // -- 8. Plumery -- TS SDK with npm, docs.yml
    // Source: fern-demo/plumery-config

    it("migrates the Plumery config (TS SDK, npm, docs.yml)", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "plumery", version: "0.117.0" },
            generatorsYml: `openapi: ../openapi.yml
openapi-overrides: ../openapi-overrides.yml
groups:
  node-sdk:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 0.11.0
        output:
          location: npm
          package-name: "plumery"
          token: ""
        github:
          repository: "fern-demo/plumery-node"
          mode: "pull-request"
        config:
          namespaceExport: Plumery
          allowCustomFetcher: true
          skipResponseValidation: true
`,
            docsYml: `instances:
  - url: https://plumery.docs.buildwithfern.com
title: Plumery | Docs
navigation:
  - api: API Reference
    snippets:
      typescript: plumery
colors:
  accentPrimary:
    light: "#6670f6"
  background:
    light: "#ffffff"
logo:
  href: https://plumery.docs.buildwithfern.com
  light: ./assets/Plumery-Logo.svg
  height: 35
layout:
  page-width: 1504px
  header-height: 83px
navbar-links:
  - type: primary
    text: Get Started
    url: https://plumery.com/contact/
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        expect(yml.org).toBe("plumery");

        const sdks = yml.sdks as { targets: Record<string, Record<string, unknown>> };
        expect(sdks.targets).toHaveProperty("typescript");
        const ts = sdks.targets["typescript"] as Record<string, unknown>;
        expect(ts.lang).toBe("typescript");
        const tsPublish = ts.publish as { npm: { packageName: string } };
        expect(tsPublish.npm.packageName).toBe("plumery");

        const raw = await readMigratedYmlRaw(projectDir);
        expect(raw).toContain("$ref: ./docs.yml");
        expect(raw).not.toContain("plumery.docs.buildwithfern.com");
    });

    // -- 9. ShipBob -- default-group, openapi + TS SDK generator, docs.yml
    // Source: fern-demo/shipbob-config

    it("migrates the ShipBob config (default-group, openapi gen + TS SDK, docs.yml)", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "your-organization", version: "0.16.41" },
            generatorsYml: `default-group: local
groups:
  local:
    generators:
      - name: fernapi/fern-openapi
        version: 0.0.30
        config:
          format: yaml
        output:
          location: local-file-system
          path: ../generated/openapi

      - name: fernapi/fern-typescript-node-sdk
        version: 0.9.5
        output:
          location: local-file-system
          path: ../generated/sdk/node
`,
            docsYml: `instances:
  - url: shipbob.docs.buildwithfern.com

title: ShipBob | Docs

navigation:
  - section: Getting started
    contents:
      - page: Welcome
        path: ./docs/pages/welcome.mdx
      - page: SDKs
        path: ./docs/pages/sdks.mdx
  - section: Guides
    contents:
      - page: API Overview
        path: ./docs/pages/guides/overview.mdx
  - api: API Reference

navbar-links:
  - type: secondary
    text: Support
    url: developers@shipbob.com

colors:
  accentPrimary:
    dark: "#adff8c"
    light: "#376d20"

logo:
  dark: ./docs/assets/logo_dark_mode.png
  light: ./docs/assets/logo_light_mode.png
  height: 30

favicon: ./docs/assets/favicon.ico
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        expect(yml.org).toBe("your-organization");

        const raw = await readMigratedYmlRaw(projectDir);
        expect(raw).not.toContain("default-group");
        expect(raw).not.toContain("defaultGroup");

        const sdks = yml.sdks as { targets: Record<string, Record<string, unknown>> };
        expect(sdks.targets).toHaveProperty("typescript");
        const ts = sdks.targets["typescript"] as Record<string, unknown>;
        expect(ts.lang).toBe("typescript");
        expect(ts.output).toBe("../generated/sdk/node");

        expect(raw).toContain("$ref: ./docs.yml");
    });

    // -- 10. Alpaca -- multi-API workspace (6 APIs), Postman generators
    // Source: fern-demo/alpaca-config

    it("migrates the Alpaca config (multi-API workspace with 6 APIs)", async () => {
        const postmanGen = `groups:
  postman:
    generators:
      - name: fernapi/fern-postman
        version: 0.1.1-rc0
        output:
          location: local-file-system
          path: ../generated/postman
`;

        const projectDir = await setupProject(base, {
            fernConfig: { organization: "alpaca-markets", version: "0.117.0" },
            apis: {
                broker_v1: postmanGen,
                "broker_v1.1": postmanGen,
                market_v1: postmanGen,
                "market_v1.1": postmanGen,
                trader_v1: postmanGen,
                "trader_v1.1": postmanGen
            }
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        expect(yml.org).toBe("alpaca-markets");

        expect(yml.apis).toBeDefined();
        const apis = yml.apis as Record<string, unknown>;
        expect(Object.keys(apis)).toHaveLength(6);
        expect(apis).toHaveProperty("broker_v1");
        expect(apis).toHaveProperty("broker_v1.1");
        expect(apis).toHaveProperty("market_v1");
        expect(apis).toHaveProperty("trader_v1");
    });

    // -- 11. Cal.com -- TS SDK with smart-casing, github output
    // Source: fern-demo/cal-config

    it("migrates the Cal.com config (TS SDK, smart-casing)", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "cal", version: "0.117.0" },
            generatorsYml: `openapi: ../openapi.json
openapi-overrides: ../openapi-overrides.yml
groups:
  ts-sdk:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 0.11.0
        github:
          repository: fern-demo/cal-typescript
        config:
          namespaceExport: Cal
          allowCustomFetcher: true
          skipResponseValidation: true
        smart-casing: true
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        expect(yml.org).toBe("cal");

        const sdks = yml.sdks as { targets: Record<string, Record<string, unknown>> };
        expect(sdks.targets).toHaveProperty("typescript");
        const ts = sdks.targets["typescript"] as Record<string, unknown>;
        expect(ts.lang).toBe("typescript");
        expect(ts.version).toBe("0.11.0");

        const tsOutput = ts.output as { git: { repository: string } };
        expect(tsOutput.git.repository).toBe("fern-demo/cal-typescript");
    });

    // -- 12. TRM Labs -- TS SDK, smart-casing, overrides
    // Source: fern-demo/trmlabs-config

    it("migrates the TRM Labs config (TS SDK, smart-casing, overrides)", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "trmlabs", version: "0.117.0" },
            generatorsYml: `openapi: ../trmlabs-public-v2.yaml
openapi-overrides: ../openapi-overrides.yml
groups:
  ts-sdk:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 0.12.2
        github:
          repository: fern-demo/trmlabs-typescript
          mode: pull-request
        config:
          namespaceExport: TRMLabs
          skipResponseValidation: true
          allowCustomFetcher: true
`
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        expect(yml.org).toBe("trmlabs");

        const sdks = yml.sdks as { targets: Record<string, Record<string, unknown>> };
        expect(sdks.targets).toHaveProperty("typescript");
        const ts = sdks.targets["typescript"] as Record<string, unknown>;
        expect(ts.lang).toBe("typescript");
        expect(ts.version).toBe("0.12.2");
        expect(ts.config).toEqual({
            namespaceExport: "TRMLabs",
            skipResponseValidation: true,
            allowCustomFetcher: true
        });

        const tsOutput = ts.output as { git: { repository: string; mode: string } };
        expect(tsOutput.git.repository).toBe("fern-demo/trmlabs-typescript");
        expect(tsOutput.git.mode).toBe("pr");
    });

    // -- 13. Plumery with GitHub workflow migration
    // Uses real Plumery config + a realistic workflow

    it("migrates GitHub workflow files alongside the Plumery config", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "plumery", version: "0.117.0" },
            generatorsYml: `openapi: ../openapi.yml
groups:
  node-sdk:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 0.11.0
        output:
          location: npm
          package-name: "plumery"
          token: ""
        github:
          repository: "fern-demo/plumery-node"
          mode: "pull-request"
        config:
          namespaceExport: Plumery
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
      - name: Generate Node SDK
        run: fern generate --group node-sdk
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

        const generateContent = await readFile(join(projectDir, ".github", "workflows", "generate.yml"), "utf-8");
        expect(generateContent).toContain("fern sdk generate --target node-sdk");
        expect(generateContent).not.toContain("fern generate --group");

        const ciContent = await readFile(join(projectDir, ".github", "workflows", "ci.yml"), "utf-8");
        expect(ciContent).not.toContain("fern sdk generate");
        expect(ciContent).toContain("npm test");
    });

    // -- 14. Intercom with fern-api prefix workflow
    // Uses real Intercom config + workflow using npx fern-api generate

    it("migrates fern-api prefix commands in workflows (Intercom-style)", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "intercom", version: "0.117.0" },
            generatorsYml: `api:
  specs:
    - openapi: ../openapi.yml
groups:
  ts-sdk:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 0.44.3
        output:
          location: npm
          package-name: intercom-sdk
        github:
          repository: fern-demo/intercom-typescript
          mode: pull-request
`,
            workflows: {
                "publish.yml": `name: Publish SDKs
on:
  release:
    types: [published]
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx fern-api generate --group ts-sdk
      - run: npx fern-api generate --group java-sdk
`
            }
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const workflowContent = await readFile(join(projectDir, ".github", "workflows", "publish.yml"), "utf-8");
        expect(workflowContent).toContain("fern-api sdk generate --target ts-sdk");
        expect(workflowContent).toContain("fern-api sdk generate --target java-sdk");
        expect(workflowContent).not.toContain("fern-api generate --group");
    });

    // -- 15. Full integration: Sayari with docs + workflows
    // Combines real Sayari generators with docs and workflows

    it("migrates a full-stack Sayari-like project (generators + docs + workflows)", async () => {
        const projectDir = await setupProject(base, {
            fernConfig: { organization: "sayari-analytics", version: "0.117.0" },
            generatorsYml: `default-group: all
groups:
  python-cloud:
    generators:
      - name: fernapi/fern-python-sdk
        version: 1.4.0-rc3
        output:
          location: pypi
          package-name: "sayari"
          token: ""
        github:
          repository: "fern-demo/sayari-python"
          mode: pull-request
        config:
          package_name: sayari
          client_class_name: "Sayari"
  go:
    generators:
      - name: fernapi/fern-go-sdk
        version: 9.0.2
        config:
          importPath: github.com/sayari-analytics/sayari-go/generated/go
        output:
          location: local-file-system
          path: ../generated/go
`,
            docsYml: `instances:
  - url: sayari.docs.buildwithfern.com
title: Sayari | Docs
navigation:
  - api: API Reference
`,
            workflows: {
                "generate-sdks.yml": `name: Generate SDKs
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
      - name: Generate Python
        run: fern generate --group python-cloud
      - name: Generate Go
        run: fern generate --group go
`
            }
        });

        const result = await runMigration(projectDir);
        expect(result.success).toBe(true);

        const yml = await readMigratedYml(projectDir);
        expect(yml.org).toBe("sayari-analytics");

        const sdks = yml.sdks as { targets: Record<string, Record<string, unknown>> };
        expect(sdks.targets).toHaveProperty("python");
        expect(sdks.targets).toHaveProperty("go");

        const raw = await readMigratedYmlRaw(projectDir);
        expect(raw).toContain("$ref: ./docs.yml");
        expect(raw).not.toContain("default-group");

        const workflowContent = await readFile(join(projectDir, ".github", "workflows", "generate-sdks.yml"), "utf-8");
        expect(workflowContent).toContain("fern sdk generate --target python-cloud");
        expect(workflowContent).toContain("fern sdk generate --target go");
        expect(workflowContent).not.toContain("fern generate --group");
    });
});
