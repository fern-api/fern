import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { randomUUID } from "crypto";
import { mkdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isAsyncApiSpec } from "../api/config/AsyncApiSpec";
import { isConjureSpec } from "../api/config/ConjureSpec";
import { isFernSpec } from "../api/config/FernSpec";
import { isOpenApiSpec } from "../api/config/OpenApiSpec";
import { isOpenRpcSpec } from "../api/config/OpenRpcSpec";
import { isProtobufSpec } from "../api/config/ProtobufSpec";
import { ApiDefinitionConverter, DEFAULT_API_NAME } from "../api/converter/ApiDefinitionConverter";
import { loadFernYml } from "../config/fern-yml/loadFernYml";

describe("ApiDefinitionConverter", () => {
    let testDir: AbsoluteFilePath;

    beforeEach(async () => {
        testDir = AbsoluteFilePath.of(join(tmpdir(), `fern-api-config-test-${randomUUID()}`));
        await mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    function createConverter() {
        return new ApiDefinitionConverter({
            cwd: AbsoluteFilePath.of(testDir)
        });
    }

    describe("apis configuration", () => {
        it("converts empty apis config to empty result", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
apis: {}
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createConverter().convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(Object.keys(result.apis)).toHaveLength(0);
            }
        });

        it("converts single OpenAPI spec", async () => {
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
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createConverter().convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(Object.keys(result.apis)).toHaveLength(1);
                const api = result.apis["my-api"];
                expect(api).toBeDefined();
                expect(api?.specs).toHaveLength(1);
                const spec = api?.specs[0];
                expect(spec).toBeDefined();
                expect(spec != null && isOpenApiSpec(spec)).toBe(true);
            }
        });

        it("converts OpenAPI spec with overrides", async () => {
            await mkdir(join(testDir, "apis"), { recursive: true });
            await writeFile(join(testDir, "apis/openapi.yml"), "openapi: 3.0.0");
            await writeFile(join(testDir, "apis/overrides.yml"), "{}");
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
apis:
  my-api:
    specs:
      - openapi: apis/openapi.yml
        overrides: apis/overrides.yml
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createConverter().convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                const spec = result.apis["my-api"]?.specs[0];
                expect(spec).toBeDefined();
                if (spec != null && isOpenApiSpec(spec)) {
                    expect(spec.overrides).toBeDefined();
                }
            }
        });

        it("converts OpenAPI spec with settings", async () => {
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
        settings:
          respectReadonlySchemas: true
          coerceEnumsToLiterals: true
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createConverter().convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                const spec = result.apis["my-api"]?.specs[0];
                expect(spec).toBeDefined();
                if (spec != null && isOpenApiSpec(spec)) {
                    expect(spec.settings?.respectReadonlySchemas).toBe(true);
                    expect(spec.settings?.coerceEnumsToLiterals).toBe(true);
                }
            }
        });

        it("converts AsyncAPI spec", async () => {
            await mkdir(join(testDir, "apis"), { recursive: true });
            await writeFile(join(testDir, "apis/asyncapi.yml"), "asyncapi: 2.0.0");
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
apis:
  events-api:
    specs:
      - asyncapi: apis/asyncapi.yml
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createConverter().convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                const spec = result.apis["events-api"]?.specs[0];
                expect(spec).toBeDefined();
                expect(spec != null && isAsyncApiSpec(spec)).toBe(true);
            }
        });

        it("converts Protobuf spec", async () => {
            await mkdir(join(testDir, "protos"), { recursive: true });
            await writeFile(join(testDir, "protos/api.proto"), 'syntax = "proto3";');
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
apis:
  grpc-api:
    specs:
      - proto:
          root: protos
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createConverter().convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                const spec = result.apis["grpc-api"]?.specs[0];
                expect(spec).toBeDefined();
                expect(spec != null && isProtobufSpec(spec)).toBe(true);
            }
        });

        it("converts Fern spec", async () => {
            await mkdir(join(testDir, "definition"), { recursive: true });
            await writeFile(join(testDir, "definition/api.yml"), "name: api");
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
apis:
  fern-api:
    specs:
      - fern: definition
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createConverter().convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                const spec = result.apis["fern-api"]?.specs[0];
                expect(spec).toBeDefined();
                expect(spec != null && isFernSpec(spec)).toBe(true);
            }
        });

        it("converts Conjure spec", async () => {
            await mkdir(join(testDir, "conjure"), { recursive: true });
            await writeFile(join(testDir, "conjure/api.yml"), "types: {}");
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
apis:
  conjure-api:
    specs:
      - conjure: conjure/api.yml
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createConverter().convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                const spec = result.apis["conjure-api"]?.specs[0];
                expect(spec).toBeDefined();
                expect(spec != null && isConjureSpec(spec)).toBe(true);
            }
        });

        it("converts OpenRPC spec", async () => {
            await mkdir(join(testDir, "rpc"), { recursive: true });
            await writeFile(join(testDir, "rpc/openrpc.json"), "{}");
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
apis:
  jsonrpc-api:
    specs:
      - openrpc: rpc/openrpc.json
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createConverter().convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                const spec = result.apis["jsonrpc-api"]?.specs[0];
                expect(spec).toBeDefined();
                expect(spec != null && isOpenRpcSpec(spec)).toBe(true);
            }
        });

        it("converts multiple APIs", async () => {
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
            const result = await createConverter().convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(Object.keys(result.apis)).toHaveLength(2);
                expect(result.apis["api-v1"]).toBeDefined();
                expect(result.apis["api-v2"]).toBeDefined();
            }
        });

        it("converts API definition with multiple specs", async () => {
            await mkdir(join(testDir, "apis"), { recursive: true });
            await writeFile(join(testDir, "apis/rest.yml"), "openapi: 3.0.0");
            await writeFile(join(testDir, "apis/events.yml"), "asyncapi: 2.0.0");
            await writeFile(join(testDir, "apis/rpc.json"), "{}");
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
apis:
  combined-api:
    specs:
      - openapi: apis/rest.yml
      - asyncapi: apis/events.yml
      - openrpc: apis/rpc.json
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createConverter().convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                const api = result.apis["combined-api"];
                expect(api?.specs).toHaveLength(3);
                const spec0 = api?.specs[0];
                const spec1 = api?.specs[1];
                const spec2 = api?.specs[2];
                expect(spec0 != null && isOpenApiSpec(spec0)).toBe(true);
                expect(spec1 != null && isAsyncApiSpec(spec1)).toBe(true);
                expect(spec2 != null && isOpenRpcSpec(spec2)).toBe(true);
            }
        });
    });

    describe("api configuration (singular)", () => {
        it("converts single api config using DEFAULT_API_NAME as key", async () => {
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
            const result = await createConverter().convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(Object.keys(result.apis)).toHaveLength(1);
                expect(result.apis[DEFAULT_API_NAME]).toBeDefined();
                const spec = result.apis[DEFAULT_API_NAME]?.specs[0];
                expect(spec).toBeDefined();
                expect(spec != null && isOpenApiSpec(spec)).toBe(true);
            }
        });

        it("converts single api config with multiple specs", async () => {
            await mkdir(join(testDir, "apis"), { recursive: true });
            await writeFile(join(testDir, "apis/openapi.yml"), "openapi: 3.0.0");
            await writeFile(join(testDir, "apis/events.yml"), "asyncapi: 2.0.0");
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
api:
  specs:
    - openapi: apis/openapi.yml
    - asyncapi: apis/events.yml
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createConverter().convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                const api = result.apis[DEFAULT_API_NAME];
                expect(api?.specs).toHaveLength(2);
                const spec0 = api?.specs[0];
                const spec1 = api?.specs[1];
                expect(spec0 != null && isOpenApiSpec(spec0)).toBe(true);
                expect(spec1 != null && isAsyncApiSpec(spec1)).toBe(true);
            }
        });
    });

    describe("validation", () => {
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
  my-api:
    specs:
      - openapi: apis/other.yml
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createConverter().convert({ fernYml });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues).toHaveLength(1);
                expect(result.issues[0]?.message).toContain("Cannot define both 'api' and 'apis'");
            }
        });

        it("succeeds with empty apis when neither api nor apis is defined", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createConverter().convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(Object.keys(result.apis)).toHaveLength(0);
            }
        });

        it("reports error with source location when file does not exist", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
apis:
  my-api:
    specs:
      - openapi: apis/nonexistent.yml
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = await createConverter().convert({ fernYml });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues).toHaveLength(1);
                expect(result.issues[0]?.message).toContain("does not exist");
                expect(result.issues[0]?.location).toBeDefined();
            }
        });
    });
});
