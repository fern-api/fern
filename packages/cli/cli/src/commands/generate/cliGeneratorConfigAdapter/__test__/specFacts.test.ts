import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createMockTaskContext } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";
import YAML from "yaml";

import { extractSpecFacts, loadSpecFacts } from "../specFacts.js";
import { codes, SPECS, tempFolder } from "./helpers.js";

async function spec(name: string): Promise<Record<string, unknown>> {
    return YAML.parse(await readFile(join(SPECS, name), "utf8"));
}

function load(specPath: string, options: { overridePaths?: string[]; overlayPath?: string } = {}) {
    return loadSpecFacts({
        context: createMockTaskContext(),
        specPath,
        overridePaths: options.overridePaths ?? [],
        overlayPath: options.overlayPath,
        diagnosticPath: "source.specs[0]"
    });
}

describe("extractSpecFacts", () => {
    it("collects security schemes with type, in, name and scheme", async () => {
        const facts = extractSpecFacts(await spec("headers.yml"));
        expect(facts.securitySchemes).toEqual({
            apiKey: { type: "apiKey", in: "header", name: "X-Api-Key" },
            bearer: { type: "http", scheme: "bearer" }
        });
    });

    it("collects Swagger 2.0 securityDefinitions", async () => {
        const facts = extractSpecFacts(await spec("swagger2.yml"));
        expect(facts.securitySchemes).toEqual({ ApiKey: { type: "apiKey", in: "header", name: "X-Api-Key" } });
    });

    it("collects header names from operation parameters and path-level parameters, lowercased", async () => {
        const facts = extractSpecFacts(await spec("headers.yml"));
        expect(facts.declaredHeaders).toEqual(expect.arrayContaining(["x-op-header", "x-path-header", "x-ref-header"]));
    });

    it("collects x-fern-global-headers by header", async () => {
        const facts = extractSpecFacts(await spec("headers.yml"));
        expect(facts.declaredHeaders).toContain("x-global-header");
    });

    it("collects x-fern-global-parameters with in: header, under target when set, else name", async () => {
        const facts = extractSpecFacts(await spec("headers.yml"));
        expect(facts.declaredHeaders).toEqual(expect.arrayContaining(["x-tenant-id", "x-region"]));
        expect(facts.declaredHeaders).not.toContain("tenant");
        expect(facts.declaredHeaders).not.toContain("page");
    });

    it("collects the wire name of a header API-key scheme", async () => {
        const facts = extractSpecFacts(await spec("headers.yml"));
        expect(facts.declaredHeaders).toContain("x-api-key");
    });

    it("keeps header API-key scheme keys separately, for the migrate compensation", async () => {
        const facts = extractSpecFacts(await spec("headers.yml"));
        expect(facts.schemeKeys).toEqual(["apikey"]);
        expect(facts.declaredHeaders).not.toContain("apikey");
    });

    it("collects request and response property names for each POST operation", async () => {
        const facts = extractSpecFacts(await spec("server-path.yml"));
        expect(facts.postOperations["/oauth/token"]).toEqual({
            requestProperties: ["client_id", "client_secret", "scope"],
            responseProperties: ["access_token", "expires_in", "refresh_token"]
        });
    });

    it("reads response properties from any 2xx response, not only 200", async () => {
        const facts = extractSpecFacts(await spec("token-201.yml"));
        expect(facts.postOperations["/token"]?.responseProperties).toContain("expires_in");
    });

    it("merges allOf parts into the property list", async () => {
        const facts = extractSpecFacts(await spec("token-201.yml"));
        expect(facts.postOperations["/token"]?.responseProperties).toEqual(["access_token", "expires_in"]);
    });

    it("reads Swagger 2.0 formData and body parameters as request properties", async () => {
        const facts = extractSpecFacts(await spec("swagger2.yml"));
        expect(facts.postOperations["/token"]).toEqual({
            requestProperties: ["client_id", "client_secret"],
            responseProperties: ["access_token"]
        });
    });

    it("resolves local $ref, and returns undefined on a $ref cycle instead of looping", async () => {
        const document = await spec("token-201.yml");
        const components = document.components as { schemas: Record<string, unknown> };
        components.schemas.Base = { $ref: "#/components/schemas/Loop" };
        const facts = extractSpecFacts(document);
        expect(facts.postOperations["/token"]?.responseProperties).toEqual(["expires_in"]);
    });

    it("collects server URLs from servers[], and from Swagger 2.0 host, basePath and schemes", async () => {
        expect(extractSpecFacts(await spec("server-path.yml")).serverUrls).toEqual(["https://api.example.com/v1"]);
        expect(extractSpecFacts(await spec("swagger2.yml")).serverUrls).toEqual(["https://api.acme.test/v2"]);
    });
});

describe("loadSpecFacts", () => {
    it("applies override files in order before extracting", async () => {
        const result = await load(join(SPECS, "minimal.yml"), { overridePaths: [join(SPECS, "override-token.yml")] });
        expect(result.diagnostics).toEqual([]);
        expect(result.facts?.postOperations["/token"]?.responseProperties).toEqual(["access_token"]);
    });

    it("applies the overlay before extracting", async () => {
        const result = await load(join(SPECS, "minimal.yml"), { overlayPath: join(SPECS, "overlay-security.yml") });
        expect(result.facts?.declaredHeaders).toContain("x-overlay-key");
    });

    it("resolves a $ref to another file through the bundler", async () => {
        const result = await load(join(SPECS, "external-ref.yml"));
        expect(result.diagnostics).toEqual([]);
        expect(result.facts?.postOperations["/token"]?.responseProperties).toEqual(["access_token", "expires_in"]);
    });

    it("returns an error naming the $ref when one still points to another file after loading", async () => {
        const folder = await tempFolder({
            "openapi.yml": [
                "openapi: 3.1.0",
                "info: { title: Acme, version: '1' }",
                "paths:",
                "  /token:",
                "    post:",
                "      responses:",
                "        '200':",
                "          description: ok",
                "          content:",
                "            application/json:",
                "              schema: { $ref: './missing.yml' }"
            ].join("\n")
        });
        try {
            const result = await load(join(folder.path, "openapi.yml"));
            expect(codes(result.diagnostics)).toEqual(["error CLI_TARGET_EXTERNAL_REF source.specs[0]"]);
            expect(result.diagnostics[0]?.message).toContain("./missing.yml");
            expect(result.facts).toBeUndefined();
        } finally {
            await folder.remove();
        }
    });

    it("returns an error with the spec path when the spec does not exist", async () => {
        const result = await load(join(SPECS, "does-not-exist.yml"));
        expect(codes(result.diagnostics)).toEqual(["error CLI_TARGET_SPEC_MISSING source.specs[0]"]);
    });

    it("returns an error with the spec path when the spec does not parse", async () => {
        const folder = await tempFolder({ "openapi.yml": "openapi: [unclosed" });
        try {
            const result = await load(join(folder.path, "openapi.yml"));
            expect(codes(result.diagnostics)).toEqual(["error CLI_TARGET_SPEC_PARSE source.specs[0]"]);
        } finally {
            await folder.remove();
        }
    });
});
