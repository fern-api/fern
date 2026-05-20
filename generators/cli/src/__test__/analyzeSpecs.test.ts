import { mkdir, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { analyzeSpecs, formatSpecAnalysis } from "../analyzeSpecs.js";
import { SPECS_MANIFEST_FILENAME } from "../copySpecs.js";

describe("analyzeSpecs", () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = path.join(tmpdir(), `analyze-specs-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
        await mkdir(tmpDir, { recursive: true });
    });

    afterEach(async () => {
        const { rm } = await import("fs/promises");
        await rm(tmpDir, { recursive: true, force: true });
    });

    it("returns empty analysis when no manifest exists", async () => {
        const result = await analyzeSpecs(tmpDir);
        expect(result.totalSpecs).toBe(0);
        expect(result.totalEndpoints).toBe(0);
        expect(result.totalSchemas).toBe(0);
        expect(result.specs).toHaveLength(0);
    });

    it("returns empty analysis when manifest has no specs", async () => {
        await writeFile(path.join(tmpDir, SPECS_MANIFEST_FILENAME), JSON.stringify({ specs: [] }));
        const result = await analyzeSpecs(tmpDir);
        expect(result.totalSpecs).toBe(0);
    });

    it("analyzes a single OpenAPI spec", async () => {
        const spec = {
            openapi: "3.0.0",
            info: { title: "Pet Store", version: "1.2.3" },
            paths: {
                "/pets": { get: { summary: "List pets" }, post: { summary: "Create pet" } },
                "/pets/{id}": { get: { summary: "Get pet" }, delete: { summary: "Delete pet" } }
            },
            components: {
                schemas: {
                    Pet: { type: "object" },
                    Error: { type: "object" }
                }
            }
        };
        const specPath = path.join(tmpDir, "spec-0.json");
        await writeFile(specPath, JSON.stringify(spec));
        await writeFile(
            path.join(tmpDir, SPECS_MANIFEST_FILENAME),
            JSON.stringify({ specs: [{ type: "openapi", specPath }] })
        );

        const result = await analyzeSpecs(tmpDir);
        expect(result.totalSpecs).toBe(1);
        expect(result.totalEndpoints).toBe(4);
        expect(result.totalSchemas).toBe(2);
        expect(result.specs[0]?.title).toBe("Pet Store");
        expect(result.specs[0]?.version).toBe("1.2.3");
    });

    it("analyzes an AsyncAPI spec with channels", async () => {
        const spec = {
            asyncapi: "2.6.0",
            info: { title: "Events API", version: "0.1.0" },
            channels: {
                "user/signup": { subscribe: {} },
                "order/created": { publish: {} }
            }
        };
        const specPath = path.join(tmpDir, "spec-0.json");
        await writeFile(specPath, JSON.stringify(spec));
        await writeFile(
            path.join(tmpDir, SPECS_MANIFEST_FILENAME),
            JSON.stringify({ specs: [{ type: "asyncapi", specPath }] })
        );

        const result = await analyzeSpecs(tmpDir);
        expect(result.totalSpecs).toBe(1);
        expect(result.totalEndpoints).toBe(2);
        expect(result.specs[0]?.title).toBe("Events API");
    });

    it("analyzes an OpenRPC spec with methods", async () => {
        const spec = {
            openrpc: "1.0.0",
            info: { title: "JSON-RPC Service", version: "2.0.0" },
            methods: [{ name: "eth_getBalance" }, { name: "eth_call" }, { name: "eth_sendTransaction" }]
        };
        const specPath = path.join(tmpDir, "spec-0.json");
        await writeFile(specPath, JSON.stringify(spec));
        await writeFile(
            path.join(tmpDir, SPECS_MANIFEST_FILENAME),
            JSON.stringify({ specs: [{ type: "openrpc", specPath }] })
        );

        const result = await analyzeSpecs(tmpDir);
        expect(result.totalSpecs).toBe(1);
        expect(result.totalEndpoints).toBe(3);
        expect(result.specs[0]?.title).toBe("JSON-RPC Service");
    });

    it("returns zero counts for protobuf specs", async () => {
        const specPath = path.join(tmpDir, "proto");
        await mkdir(specPath, { recursive: true });
        await writeFile(
            path.join(tmpDir, SPECS_MANIFEST_FILENAME),
            JSON.stringify({ specs: [{ type: "protobuf", specPath }] })
        );

        const result = await analyzeSpecs(tmpDir);
        expect(result.totalSpecs).toBe(1);
        expect(result.totalEndpoints).toBe(0);
        expect(result.totalSchemas).toBe(0);
    });

    it("handles multiple specs and sums totals", async () => {
        const spec1 = {
            openapi: "3.0.0",
            info: { title: "API 1", version: "1.0.0" },
            paths: { "/a": { get: {} } },
            components: { schemas: { A: { type: "object" } } }
        };
        const spec2 = {
            openapi: "3.0.0",
            info: { title: "API 2", version: "2.0.0" },
            paths: { "/b": { post: {} }, "/c": { put: {} } },
            components: { schemas: { B: { type: "object" }, C: { type: "object" } } }
        };
        const specPath1 = path.join(tmpDir, "spec-0.json");
        const specPath2 = path.join(tmpDir, "spec-1.json");
        await writeFile(specPath1, JSON.stringify(spec1));
        await writeFile(specPath2, JSON.stringify(spec2));
        await writeFile(
            path.join(tmpDir, SPECS_MANIFEST_FILENAME),
            JSON.stringify({
                specs: [
                    { type: "openapi", specPath: specPath1 },
                    { type: "openapi", specPath: specPath2 }
                ]
            })
        );

        const result = await analyzeSpecs(tmpDir);
        expect(result.totalSpecs).toBe(2);
        expect(result.totalEndpoints).toBe(3);
        expect(result.totalSchemas).toBe(3);
    });

    it("handles malformed spec file gracefully", async () => {
        const specPath = path.join(tmpDir, "spec-0.json");
        await writeFile(specPath, "not valid json {{{");
        await writeFile(
            path.join(tmpDir, SPECS_MANIFEST_FILENAME),
            JSON.stringify({ specs: [{ type: "openapi", specPath }] })
        );

        const result = await analyzeSpecs(tmpDir);
        expect(result.totalSpecs).toBe(1);
        expect(result.totalEndpoints).toBe(0);
        expect(result.specs[0]?.title).toBeUndefined();
    });

    it("handles missing spec file gracefully", async () => {
        await writeFile(
            path.join(tmpDir, SPECS_MANIFEST_FILENAME),
            JSON.stringify({ specs: [{ type: "openapi", specPath: path.join(tmpDir, "missing.json") }] })
        );

        const result = await analyzeSpecs(tmpDir);
        expect(result.totalSpecs).toBe(1);
        expect(result.totalEndpoints).toBe(0);
    });
});

describe("formatSpecAnalysis", () => {
    it("formats analysis with specs", () => {
        const output = formatSpecAnalysis({
            totalSpecs: 1,
            totalEndpoints: 5,
            totalSchemas: 3,
            specs: [
                {
                    type: "openapi",
                    title: "My API",
                    version: "1.0.0",
                    endpointCount: 5,
                    schemaCount: 3,
                    specPath: "/fern/specs/spec-0.json"
                }
            ]
        });
        expect(output).toContain("Total specs:     1");
        expect(output).toContain("Total endpoints: 5");
        expect(output).toContain("Total schemas:   3");
        expect(output).toContain("My API");
        expect(output).toContain("1.0.0");
    });

    it("formats empty analysis", () => {
        const output = formatSpecAnalysis({
            totalSpecs: 0,
            totalEndpoints: 0,
            totalSchemas: 0,
            specs: []
        });
        expect(output).toContain("Total specs:     0");
    });
});
