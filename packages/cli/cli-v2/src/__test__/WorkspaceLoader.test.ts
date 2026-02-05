import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { NOOP_LOGGER } from "@fern-api/logger";
import { randomUUID } from "crypto";
import { mkdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isOpenApiSpec } from "../api/config/OpenApiSpec";
import { loadFernYml } from "../config/fern-yml/loadFernYml";
import { WorkspaceLoader } from "../workspace/WorkspaceLoader";

describe("WorkspaceLoader", () => {
    let testDir: AbsoluteFilePath;

    beforeEach(async () => {
        testDir = AbsoluteFilePath.of(join(tmpdir(), `fern-workspace-test-${randomUUID()}`));
        await mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    function createLoader(): WorkspaceLoader {
        return new WorkspaceLoader({
            cwd: testDir,
            logger: NOOP_LOGGER
        });
    }

    describe("basic loading", () => {
        it("loads workspace with single API and no SDKs", async () => {
            await mkdir(join(testDir, "apis"), { recursive: true });
            await writeFile(join(testDir, "apis/openapi.yml"), "openapi: 3.0.0");
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
api:
  specs:
    - openapi: apis/openapi.yml
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createLoader().load({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(Object.keys(result.workspace.apis)).toHaveLength(1);
                expect(result.workspace.apis["api"]).toBeDefined();
                expect(result.workspace.sdks).toBeUndefined();
            }
        });

        it("loads workspace with APIs and SDKs", async () => {
            await mkdir(join(testDir, "apis"), { recursive: true });
            await writeFile(join(testDir, "apis/openapi.yml"), "openapi: 3.0.0");
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
api:
  specs:
    - openapi: apis/openapi.yml
sdks:
  targets:
    typescript:
      version: "1.0.0"
      output:
        path: ./sdks/typescript
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createLoader().load({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(Object.keys(result.workspace.apis)).toHaveLength(1);
                expect(result.workspace.sdks).toBeDefined();
                expect(result.workspace.sdks?.org).toBe("acme");
                expect(result.workspace.sdks?.targets).toHaveLength(1);
            }
        });

        it("loads workspace with multiple named APIs", async () => {
            await mkdir(join(testDir, "apis/v1"), { recursive: true });
            await mkdir(join(testDir, "apis/v2"), { recursive: true });
            await writeFile(join(testDir, "apis/v1/openapi.yml"), "openapi: 3.0.0");
            await writeFile(join(testDir, "apis/v2/openapi.yml"), "openapi: 3.0.0");
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
apis:
  api-v1:
    specs:
      - openapi: apis/v1/openapi.yml
  api-v2:
    specs:
      - openapi: apis/v2/openapi.yml
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createLoader().load({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(Object.keys(result.workspace.apis)).toHaveLength(2);
                expect(result.workspace.apis["api-v1"]).toBeDefined();
                expect(result.workspace.apis["api-v2"]).toBeDefined();
            }
        });
    });

    describe("API resolution", () => {
        it("resolves API spec paths to absolute paths", async () => {
            await mkdir(join(testDir, "specs"), { recursive: true });
            await writeFile(join(testDir, "specs/openapi.yml"), "openapi: 3.0.0");
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
api:
  specs:
    - openapi: specs/openapi.yml
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createLoader().load({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                const spec = result.workspace.apis["api"]?.specs[0];
                expect(spec).toBeDefined();
                if (spec != null && isOpenApiSpec(spec)) {
                    expect(spec.openapi).toBe(join(testDir, "specs/openapi.yml"));
                }
            }
        });

        it("resolves overrides path when specified", async () => {
            await mkdir(join(testDir, "specs"), { recursive: true });
            await writeFile(join(testDir, "specs/openapi.yml"), "openapi: 3.0.0");
            await writeFile(join(testDir, "specs/overrides.yml"), "{}");
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
api:
  specs:
    - openapi: specs/openapi.yml
      overrides: specs/overrides.yml
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createLoader().load({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                const spec = result.workspace.apis["api"]?.specs[0];
                expect(spec).toBeDefined();
                if (spec != null && isOpenApiSpec(spec)) {
                    expect(spec.overrides).toBe(join(testDir, "specs/overrides.yml"));
                }
            }
        });
    });

    describe("SDK resolution", () => {
        it("resolves SDK targets with docker images", async () => {
            await mkdir(join(testDir, "apis"), { recursive: true });
            await writeFile(join(testDir, "apis/openapi.yml"), "openapi: 3.0.0");
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
api:
  specs:
    - openapi: apis/openapi.yml
sdks:
  targets:
    python:
      version: "1.0.0"
      output:
        path: ./sdks/python
    typescript:
      version: "2.0.0"
      output:
        path: ./sdks/typescript
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createLoader().load({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.workspace.sdks?.targets).toHaveLength(2);

                const pythonTarget = result.workspace.sdks?.targets.find((t) => t.name === "python");
                expect(pythonTarget?.image).toBe("fernapi/fern-python-sdk");
                expect(pythonTarget?.version).toBe("1.0.0");

                const tsTarget = result.workspace.sdks?.targets.find((t) => t.name === "typescript");
                expect(tsTarget?.image).toBe("fernapi/fern-typescript-sdk");
                expect(tsTarget?.version).toBe("2.0.0");
            }
        });

        it("includes SDK default group when specified", async () => {
            await mkdir(join(testDir, "apis"), { recursive: true });
            await writeFile(join(testDir, "apis/openapi.yml"), "openapi: 3.0.0");
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
api:
  specs:
    - openapi: apis/openapi.yml
sdks:
  defaultGroup: production
  targets:
    python:
      output:
        path: ./sdks/python
      group:
        - production
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createLoader().load({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.workspace.sdks?.defaultGroup).toBe("production");
            }
        });
    });

    describe("validation errors", () => {
        it("fails when API spec file does not exist", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
api:
  specs:
    - openapi: nonexistent/openapi.yml
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createLoader().load({ fernYml });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues.length).toBeGreaterThan(0);
                expect(result.issues[0]?.message).toContain("does not exist");
            }
        });

        it("fails when SDK target has unrecognized language", async () => {
            await mkdir(join(testDir, "apis"), { recursive: true });
            await writeFile(join(testDir, "apis/openapi.yml"), "openapi: 3.0.0");
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
api:
  specs:
    - openapi: apis/openapi.yml
sdks:
  targets:
    my-custom-sdk:
      output:
        path: ./sdks/custom
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createLoader().load({ fernYml });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues.length).toBeGreaterThan(0);
                expect(result.issues[0]?.message).toContain("not a recognized language");
            }
        });

        it("collects errors from both API and SDK conversion", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
api:
  specs:
    - openapi: nonexistent/openapi.yml
sdks:
  targets:
    unknown-lang:
      output:
        path: ./sdks/unknown
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createLoader().load({ fernYml });

            expect(result.success).toBe(false);
            if (!result.success) {
                // Should have errors from both API (file not found) and SDK (unknown language)
                expect(result.issues.length).toBeGreaterThanOrEqual(2);
            }
        });

        it("fails when neither api nor apis is defined", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  targets:
    python:
      output:
        path: ./sdks/python
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createLoader().load({ fernYml });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues.length).toBeGreaterThan(0);
                expect(result.issues[0]?.message).toContain("SDKs require at least one API defined in fern.yml");
            }
        });

        it("fails when both api and apis are defined", async () => {
            await mkdir(join(testDir, "apis"), { recursive: true });
            await writeFile(join(testDir, "apis/openapi.yml"), "openapi: 3.0.0");
            await writeFile(join(testDir, "apis/other.yml"), "openapi: 3.0.0");
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
api:
  specs:
    - openapi: apis/openapi.yml
apis:
  other:
    specs:
      - openapi: apis/other.yml
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createLoader().load({ fernYml });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues.length).toBeGreaterThan(0);
                expect(result.issues[0]?.message).toContain("Cannot define both 'api' and 'apis'");
            }
        });

        it("fails when defaultGroup is not referenced by any target", async () => {
            await mkdir(join(testDir, "apis"), { recursive: true });
            await writeFile(join(testDir, "apis/openapi.yml"), "openapi: 3.0.0");
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
api:
  specs:
    - openapi: apis/openapi.yml
sdks:
  defaultGroup: production
  targets:
    python:
      output:
        path: ./sdks/python
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createLoader().load({ fernYml });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues.length).toBeGreaterThan(0);
                expect(result.issues[0]?.message).toContain(
                    "Default group 'production' is not referenced by any target"
                );
            }
        });

        it("succeeds when defaultGroup is referenced by a target", async () => {
            await mkdir(join(testDir, "apis"), { recursive: true });
            await writeFile(join(testDir, "apis/openapi.yml"), "openapi: 3.0.0");
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
api:
  specs:
    - openapi: apis/openapi.yml
sdks:
  defaultGroup: production
  targets:
    python:
      output:
        path: ./sdks/python
      group:
        - production
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createLoader().load({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.workspace.sdks?.defaultGroup).toBe("production");
            }
        });
    });

    describe("target API validation", () => {
        it("succeeds when target uses default api reference with singular api config", async () => {
            await mkdir(join(testDir, "apis"), { recursive: true });
            await writeFile(join(testDir, "apis/openapi.yml"), "openapi: 3.0.0");
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
api:
  specs:
    - openapi: apis/openapi.yml
sdks:
  targets:
    python:
      output:
        path: ./sdks/python
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createLoader().load({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                const pythonTarget = result.workspace.sdks?.targets.find((t) => t.name === "python");
                expect(pythonTarget?.api).toBe("api");
            }
        });

        it("succeeds when target explicitly references a named API", async () => {
            await mkdir(join(testDir, "apis"), { recursive: true });
            await writeFile(join(testDir, "apis/openapi.yml"), "openapi: 3.0.0");
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
apis:
  my-api:
    specs:
      - openapi: apis/openapi.yml
sdks:
  targets:
    python:
      api: my-api
      output:
        path: ./sdks/python
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createLoader().load({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                const pythonTarget = result.workspace.sdks?.targets.find((t) => t.name === "python");
                expect(pythonTarget?.api).toBe("my-api");
            }
        });

        it("fails when target references non-existent API", async () => {
            await mkdir(join(testDir, "apis"), { recursive: true });
            await writeFile(join(testDir, "apis/openapi.yml"), "openapi: 3.0.0");
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
api:
  specs:
    - openapi: apis/openapi.yml
sdks:
  targets:
    python:
      api: nonexistent-api
      output:
        path: ./sdks/python
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createLoader().load({ fernYml });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues.length).toBeGreaterThan(0);
                expect(result.issues[0]?.message).toContain("API 'nonexistent-api'");
                expect(result.issues[0]?.message).toContain("is not defined");
            }
        });

        it("fails when target uses default api but apis (plural) is configured", async () => {
            await mkdir(join(testDir, "apis"), { recursive: true });
            await writeFile(join(testDir, "apis/openapi.yml"), "openapi: 3.0.0");
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
apis:
  my-api:
    specs:
      - openapi: apis/openapi.yml
sdks:
  targets:
    python:
      output:
        path: ./sdks/python
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createLoader().load({ fernYml });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues.length).toBeGreaterThan(0);
                expect(result.issues[0]?.message).toContain("API 'api'");
                expect(result.issues[0]?.message).toContain("is not defined");
            }
        });

        it("validates multiple targets referencing different APIs", async () => {
            await mkdir(join(testDir, "apis/v1"), { recursive: true });
            await mkdir(join(testDir, "apis/v2"), { recursive: true });
            await writeFile(join(testDir, "apis/v1/openapi.yml"), "openapi: 3.0.0");
            await writeFile(join(testDir, "apis/v2/openapi.yml"), "openapi: 3.0.0");
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
apis:
  api-v1:
    specs:
      - openapi: apis/v1/openapi.yml
  api-v2:
    specs:
      - openapi: apis/v2/openapi.yml
sdks:
  targets:
    python-v1:
      lang: python
      api: api-v1
      output:
        path: ./sdks/python-v1
    python-v2:
      lang: python
      api: api-v2
      output:
        path: ./sdks/python-v2
    typescript:
      api: api-v1
      output:
        path: ./sdks/typescript
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createLoader().load({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.workspace.sdks?.targets).toHaveLength(3);

                const pythonV1 = result.workspace.sdks?.targets.find((t) => t.name === "python-v1");
                expect(pythonV1?.api).toBe("api-v1");

                const pythonV2 = result.workspace.sdks?.targets.find((t) => t.name === "python-v2");
                expect(pythonV2?.api).toBe("api-v2");

                const typescript = result.workspace.sdks?.targets.find((t) => t.name === "typescript");
                expect(typescript?.api).toBe("api-v1");
            }
        });

        it("reports errors for all targets with invalid API references", async () => {
            await mkdir(join(testDir, "apis"), { recursive: true });
            await writeFile(join(testDir, "apis/openapi.yml"), "openapi: 3.0.0");
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
apis:
  my-api:
    specs:
      - openapi: apis/openapi.yml
sdks:
  targets:
    python:
      api: wrong-api
      output:
        path: ./sdks/python
    typescript:
      api: also-wrong
      output:
        path: ./sdks/typescript
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createLoader().load({ fernYml });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues.length).toBe(2);
                const messages = result.issues.map((i) => i.message);
                expect(messages.some((m) => m.includes("wrong-api"))).toBe(true);
                expect(messages.some((m) => m.includes("also-wrong"))).toBe(true);
            }
        });
    });

    describe("complete workspace scenarios", () => {
        it("loads a complete workspace with multiple APIs and SDK targets", async () => {
            await mkdir(join(testDir, "apis/rest"), { recursive: true });
            await mkdir(join(testDir, "apis/events"), { recursive: true });
            await writeFile(join(testDir, "apis/rest/openapi.yml"), "openapi: 3.0.0");
            await writeFile(join(testDir, "apis/events/asyncapi.yml"), "asyncapi: 2.0.0");
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
apis:
  rest-api:
    specs:
      - openapi: apis/rest/openapi.yml
  events-api:
    specs:
      - asyncapi: apis/events/asyncapi.yml
sdks:
  defaultGroup: external
  targets:
    python:
      version: "1.0.0"
      api: rest-api
      output:
        path: ./sdks/python
      group:
        - external
    typescript:
      version: "2.0.0"
      api: events-api
      output:
        path: ./sdks/typescript
      group:
        - external
        - internal
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createLoader().load({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(Object.keys(result.workspace.apis)).toHaveLength(2);
                expect(result.workspace.apis["rest-api"]).toBeDefined();
                expect(result.workspace.apis["events-api"]).toBeDefined();

                expect(result.workspace.sdks?.org).toBe("acme");
                expect(result.workspace.sdks?.defaultGroup).toBe("external");
                expect(result.workspace.sdks?.targets).toHaveLength(2);

                const pythonTarget = result.workspace.sdks?.targets.find((t) => t.name === "python");
                expect(pythonTarget?.api).toBe("rest-api");
                expect(pythonTarget?.groups).toEqual(["external"]);

                const tsTarget = result.workspace.sdks?.targets.find((t) => t.name === "typescript");
                expect(tsTarget?.api).toBe("events-api");
                expect(tsTarget?.groups).toEqual(["external", "internal"]);
            }
        });
    });
});
