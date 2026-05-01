import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { randomUUID } from "crypto";
import { mkdir, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { convertApiSpecs, convertMultiApi, convertSingleApi } from "../converters/convertApiSpecs.js";

// ---------------------------------------------------------------------------
// convertApiSpecs (unit)
// ---------------------------------------------------------------------------

describe("convertApiSpecs", () => {
    it("returns empty specs when apiConfig is undefined", () => {
        const result = convertApiSpecs(undefined);
        expect(result.specs).toEqual([]);
        expect(result.warnings).toEqual([]);
    });

    // ── V2 schema (has `specs` array) ──────────────────────────────────────

    it("converts V2 schema with a single OpenAPI spec", () => {
        const result = convertApiSpecs({
            specs: [{ openapi: "./openapi.yml" }]
        });
        expect(result.specs).toHaveLength(1);
        expect(result.specs[0]).toMatchObject({ openapi: "./openapi.yml" });
    });

    it("converts V2 schema with OpenAPI + overrides + origin", () => {
        const result = convertApiSpecs({
            specs: [
                {
                    openapi: "./openapi.yml",
                    overrides: "./overrides.yml",
                    origin: "https://api.example.com/openapi.yml"
                }
            ]
        });
        const spec = result.specs[0] as { openapi: string; overrides: string; origin: string };
        expect(spec.openapi).toBe("./openapi.yml");
        expect(spec.overrides).toBe("./overrides.yml");
        expect(spec.origin).toBe("https://api.example.com/openapi.yml");
    });

    it("converts V2 schema with AsyncAPI spec", () => {
        const result = convertApiSpecs({
            specs: [{ asyncapi: "./asyncapi.yml" }]
        });
        expect(result.specs[0]).toMatchObject({ asyncapi: "./asyncapi.yml" });
    });

    it("converts V2 schema with multiple specs (OpenAPI + AsyncAPI)", () => {
        const result = convertApiSpecs({
            specs: [{ openapi: "./openapi.yml", overrides: "./overrides.yml" }, { asyncapi: "./asyncapi.yml" }]
        });
        expect(result.specs).toHaveLength(2);
        expect(result.specs[0]).toMatchObject({ openapi: "./openapi.yml" });
        expect(result.specs[1]).toMatchObject({ asyncapi: "./asyncapi.yml" });
    });

    it("converts V2 schema with proto spec (local-generation and from-openapi)", () => {
        const result = convertApiSpecs({
            specs: [
                {
                    proto: {
                        root: "./proto",
                        overrides: "./overrides.yml",
                        "local-generation": true,
                        "from-openapi": true
                    }
                }
            ]
        });
        const spec = result.specs[0] as { proto: { root: string; localGeneration: boolean; fromOpenapi: boolean } };
        expect(spec.proto.root).toBe("./proto");
        expect(spec.proto.localGeneration).toBe(true);
        expect(spec.proto.fromOpenapi).toBe(true);
    });

    it("converts V2 schema with openrpc spec", () => {
        const result = convertApiSpecs({
            specs: [{ openrpc: "./openrpc.json", overrides: "./overrides.yml" }]
        });
        const spec = result.specs[0] as { openrpc: string; overrides: string };
        expect(spec.openrpc).toBe("./openrpc.json");
        expect(spec.overrides).toBe("./overrides.yml");
    });

    it("converts V2 schema with graphql spec", () => {
        const result = convertApiSpecs({
            specs: [
                {
                    graphql: "./schema.graphql",
                    name: "Plants",
                    origin: "https://api.example.com/plants/graphql",
                    overrides: "./overrides.yml"
                }
            ]
        });
        const spec = result.specs[0] as { graphql: string; name: string; origin: string; overrides: string };
        expect(spec.graphql).toBe("./schema.graphql");
        expect(spec.name).toBe("Plants");
        expect(spec.origin).toBe("https://api.example.com/plants/graphql");
        expect(spec.overrides).toBe("./overrides.yml");
    });

    it("warns on unknown spec type in V2 schema", () => {
        const result = convertApiSpecs({
            specs: [{ unknownKey: "./something.yml" } as never]
        });
        expect(result.specs).toHaveLength(0);
        expect(result.warnings[0]?.type).toBe("unsupported");
    });

    // ── Namespaced API configuration ────────────────────────────────────────

    it("converts namespaced API configuration", () => {
        const result = convertApiSpecs({
            namespaces: {
                payments: { path: "./payments/openapi.yml" },
                users: { path: "./users/openapi.yml" }
            }
        });
        expect(result.specs).toHaveLength(2);
        const paymentSpec = result.specs.find(
            (s) => "openapi" in s && (s as { openapi: string }).openapi === "./payments/openapi.yml"
        );
        expect(paymentSpec).toMatchObject({ namespace: "payments" });
    });

    it("adds namespace field to OpenAPI specs in namespaced config", () => {
        const result = convertApiSpecs({
            namespaces: {
                ns1: [{ path: "./spec.yml" }]
            }
        });
        const spec = result.specs[0] as { openapi: string; namespace: string };
        expect(spec.namespace).toBe("ns1");
    });

    // ── Legacy API configuration ───────────────────────────────────────────

    it("converts legacy string config to OpenAPI spec", () => {
        const result = convertApiSpecs("./openapi.yml" as never);
        expect(result.specs[0]).toMatchObject({ openapi: "./openapi.yml" });
    });

    it("converts legacy array config", () => {
        const result = convertApiSpecs([{ path: "./openapi.yml" }] as never);
        expect(result.specs[0]).toMatchObject({ openapi: "./openapi.yml" });
    });

    it("converts legacy {path: ...} object config", () => {
        const result = convertApiSpecs({ path: "./openapi.yml", overrides: "./overrides.yml" } as never);
        const spec = result.specs[0] as { openapi: string; overrides: string };
        expect(spec.openapi).toBe("./openapi.yml");
        expect(spec.overrides).toBe("./overrides.yml");
    });

    it("converts legacy array of strings to OpenAPI specs", () => {
        const result = convertApiSpecs(["./a.yml", "./b.yml"] as never);
        expect(result.specs).toHaveLength(2);
        expect(result.specs[0]).toMatchObject({ openapi: "./a.yml" });
        expect(result.specs[1]).toMatchObject({ openapi: "./b.yml" });
    });

    it("converts legacy {path: ..., origin: ...} object", () => {
        const result = convertApiSpecs({
            path: "./openapi.yml",
            origin: "https://example.com/openapi.yml"
        } as never);
        const spec = result.specs[0] as { openapi: string; origin: string };
        expect(spec.origin).toBe("https://example.com/openapi.yml");
    });

    it("warns on unknown legacy config format", () => {
        const result = convertApiSpecs({ unknownField: true } as never);
        expect(result.specs).toHaveLength(0);
        expect(result.warnings[0]?.type).toBe("unsupported");
    });
});

// ---------------------------------------------------------------------------
// convertSingleApi (integration with filesystem)
// ---------------------------------------------------------------------------

describe("convertSingleApi", () => {
    let testDir: string;

    beforeEach(async () => {
        testDir = join(tmpdir(), `convert-single-api-test-${randomUUID()}`);
        await mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    it("returns undefined api when no generatorsYmlApi and no definition dir", async () => {
        const result = await convertSingleApi({
            fernDir: AbsoluteFilePath.of(testDir),
            generatorsYmlApi: undefined
        });
        expect(result.api).toBeUndefined();
        expect(result.warnings).toEqual([]);
    });

    it("uses generators.yml specs when no definition directory exists", async () => {
        const result = await convertSingleApi({
            fernDir: AbsoluteFilePath.of(testDir),
            generatorsYmlApi: { specs: [{ openapi: "./openapi.yml" }] }
        });
        expect(result.api?.specs[0]).toMatchObject({ openapi: "./openapi.yml" });
    });

    it("uses Fern definition directory when it exists (takes precedence over generators.yml specs)", async () => {
        await mkdir(join(testDir, "definition"), { recursive: true });
        const result = await convertSingleApi({
            fernDir: AbsoluteFilePath.of(testDir),
            generatorsYmlApi: { specs: [{ openapi: "./openapi.yml" }] }
        });
        // Definition takes precedence
        const spec = result.api?.specs[0] as { fern: string } | undefined;
        expect(spec?.fern).toContain("definition");
        // Should warn that generators.yml specs were ignored
        expect(result.warnings.some((w) => w.message.includes("Fern definition"))).toBe(true);
    });

    it("emits no warning when definition dir exists but generators.yml has no specs", async () => {
        await mkdir(join(testDir, "definition"), { recursive: true });
        const result = await convertSingleApi({
            fernDir: AbsoluteFilePath.of(testDir),
            generatorsYmlApi: undefined
        });
        const spec = result.api?.specs[0] as { fern: string } | undefined;
        expect(spec?.fern).toContain("definition");
        expect(result.warnings).toEqual([]);
    });
});

// ---------------------------------------------------------------------------
// convertMultiApi (integration with filesystem)
// ---------------------------------------------------------------------------

describe("convertMultiApi", () => {
    let testDir: string;
    let apisDir: string;

    beforeEach(async () => {
        testDir = join(tmpdir(), `convert-multi-api-test-${randomUUID()}`);
        apisDir = join(testDir, "fern", "apis");
        await mkdir(apisDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    it("converts two API directories with generators.yml specs", async () => {
        await mkdir(join(apisDir, "rest"), { recursive: true });
        await mkdir(join(apisDir, "grpc"), { recursive: true });

        const result = await convertMultiApi({
            fernDir: AbsoluteFilePath.of(join(testDir, "fern")),
            apisDir: AbsoluteFilePath.of(apisDir),
            generatorsYmlApis: {
                rest: { specs: [{ openapi: "./openapi.yml", overrides: "./overrides.yml" }] },
                grpc: { specs: [{ proto: { root: "./proto", "local-generation": true, "from-openapi": true } }] }
            }
        });

        expect(result.apis).toHaveProperty("rest");
        expect(result.apis).toHaveProperty("grpc");
    });

    it("adjusts relative spec paths to be root-relative for multi-api", async () => {
        await mkdir(join(apisDir, "rest"), { recursive: true });

        const result = await convertMultiApi({
            fernDir: AbsoluteFilePath.of(join(testDir, "fern")),
            apisDir: AbsoluteFilePath.of(apisDir),
            generatorsYmlApis: {
                rest: {
                    specs: [{ openapi: "./openapi.yml", overrides: "./overrides.yml" }, { asyncapi: "./asyncapi.yml" }]
                }
            }
        });

        const restSpecs = result.apis["rest"]?.specs ?? [];
        const openapiSpec = restSpecs.find((s) => "openapi" in s) as { openapi: string; overrides: string } | undefined;
        expect(openapiSpec?.openapi).toBe("./fern/apis/rest/openapi.yml");
        expect(openapiSpec?.overrides).toBe("./fern/apis/rest/overrides.yml");

        const asyncSpec = restSpecs.find((s) => "asyncapi" in s) as { asyncapi: string } | undefined;
        expect(asyncSpec?.asyncapi).toBe("./fern/apis/rest/asyncapi.yml");
    });

    it("uses Fern definition directory per API when present", async () => {
        await mkdir(join(apisDir, "rest", "definition"), { recursive: true });

        const result = await convertMultiApi({
            fernDir: AbsoluteFilePath.of(join(testDir, "fern")),
            apisDir: AbsoluteFilePath.of(apisDir),
            generatorsYmlApis: {
                rest: { specs: [{ openapi: "./openapi.yml" }] }
            }
        });

        const restSpecs = result.apis["rest"]?.specs ?? [];
        const fernSpec = restSpecs.find((s) => "fern" in s) as { fern: string } | undefined;
        expect(fernSpec?.fern).toContain("definition");
        expect(result.warnings.some((w) => w.message.includes("Fern definition"))).toBe(true);
    });

    it("warns and sets empty specs when API has no definition and no generators.yml", async () => {
        await mkdir(join(apisDir, "empty-api"), { recursive: true });

        const result = await convertMultiApi({
            fernDir: AbsoluteFilePath.of(join(testDir, "fern")),
            apisDir: AbsoluteFilePath.of(apisDir),
            generatorsYmlApis: {}
        });

        expect(result.apis["empty-api"]?.specs).toEqual([]);
        expect(result.warnings.some((w) => w.message.includes("No API specs"))).toBe(true);
    });

    it("does not adjust absolute paths during path adjustment", async () => {
        await mkdir(join(apisDir, "rest"), { recursive: true });

        const result = await convertMultiApi({
            fernDir: AbsoluteFilePath.of(join(testDir, "fern")),
            apisDir: AbsoluteFilePath.of(apisDir),
            generatorsYmlApis: {
                rest: {
                    specs: [{ openapi: "/absolute/path/openapi.yml" }]
                }
            }
        });

        const restSpecs = result.apis["rest"]?.specs ?? [];
        const spec = restSpecs[0] as { openapi: string } | undefined;
        // Absolute path should not be modified
        expect(spec?.openapi).toBe("/absolute/path/openapi.yml");
    });
});
