import { mkdtemp, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { RawSpecsManifestEntry } from "../copySpecs.js";
import { deriveBinaryName, toEnvVarPrefix, toKebabCase } from "../identity.js";

describe("toKebabCase", () => {
    it("lowercases and dashes a typical title", () => {
        expect(toKebabCase("Query Parameters API")).toBe("query-parameters-api");
    });

    it("normalizes underscores and mixed case", () => {
        expect(toKebabCase("ACME_Public_API_v3")).toBe("acme-public-api-v3");
    });

    it("strips leading/trailing whitespace and dashes, collapses runs", () => {
        expect(toKebabCase("  foo--Bar  ")).toBe("foo-bar");
    });

    it("strips punctuation entirely", () => {
        expect(toKebabCase("Acme, Inc. (2024) API!")).toBe("acme-inc-2024-api");
    });
});

describe("toEnvVarPrefix", () => {
    it("uppercases and underscores a kebab name", () => {
        expect(toEnvVarPrefix("acme-public")).toBe("ACME_PUBLIC");
    });

    it("single-word names just uppercase", () => {
        expect(toEnvVarPrefix("acme")).toBe("ACME");
    });
});

describe("deriveBinaryName", () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "deriveBinary-"));
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    async function writeSpec(filename: string, title: string | null): Promise<RawSpecsManifestEntry> {
        const specPath = path.join(tmpDir, filename);
        const body = title == null ? '{"openapi":"3.0.0"}' : JSON.stringify({ openapi: "3.0.0", info: { title } });
        await writeFile(specPath, body);
        return { type: "openapi", specPath };
    }

    it("customConfig.binaryName wins over spec title", async () => {
        const spec = await writeSpec("openapi0.json", "Spec Title");
        const name = await deriveBinaryName({
            customConfig: { binaryName: "Acme CLI" },
            openapiSpecs: [spec]
        });
        expect(name).toBe("acme-cli");
    });

    it("single-spec workspace falls back to spec info.title", async () => {
        const spec = await writeSpec("openapi0.json", "Query Parameters API");
        const name = await deriveBinaryName({
            customConfig: {},
            openapiSpecs: [spec]
        });
        expect(name).toBe("query-parameters-api");
    });

    it("multi-spec without customConfig.binaryName throws a clear error", async () => {
        const s1 = await writeSpec("openapi0.json", "Users");
        const s2 = await writeSpec("openapi1.json", "Billing");
        await expect(deriveBinaryName({ customConfig: {}, openapiSpecs: [s1, s2] })).rejects.toThrow(
            /Multi-spec workspaces must set `customConfig.binaryName`/
        );
    });

    it("single spec with no info.title and no customConfig.binaryName throws", async () => {
        const spec = await writeSpec("openapi0.json", null);
        await expect(deriveBinaryName({ customConfig: {}, openapiSpecs: [spec] })).rejects.toThrow(
            /has no `info.title`/
        );
    });

    it("empty/whitespace customConfig.binaryName falls through to spec title", async () => {
        const spec = await writeSpec("openapi0.json", "Some Spec");
        const name = await deriveBinaryName({
            customConfig: { binaryName: "   " },
            openapiSpecs: [spec]
        });
        expect(name).toBe("some-spec");
    });

    it("customConfig.binaryName with no alphanumeric chars throws — guards against an empty kebab-case fallthrough", async () => {
        const spec = await writeSpec("openapi0.json", "Some Spec");
        await expect(deriveBinaryName({ customConfig: { binaryName: "!!!" }, openapiSpecs: [spec] })).rejects.toThrow(
            /contains no alphanumeric characters/
        );
    });

    it("spec info.title with no alphanumeric chars throws", async () => {
        const spec = await writeSpec("openapi0.json", "/// ///");
        await expect(deriveBinaryName({ customConfig: {}, openapiSpecs: [spec] })).rejects.toThrow(
            /contains no alphanumeric characters/
        );
    });
});
