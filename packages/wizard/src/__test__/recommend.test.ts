import { describe, expect, it } from "vitest";
import { recommend } from "../recommend";
import type { Detection } from "../types";

function detection(overrides: Partial<Detection>): Detection {
    return {
        dir: "/tmp/project",
        fernProject: { exists: false },
        apiSpecs: [],
        frameworks: [],
        docsTools: [],
        agents: [],
        packageManager: "npm",
        fernCliVersion: null,
        ...overrides
    };
}

describe("recommendations", () => {
    it("recommends SDKs, docs, docs MCP, and CLI for a spec", () => {
        const ids = recommend(
            detection({
                apiSpecs: [{ path: "openapi.yaml", format: "openapi", version: "3.1.0" }]
            })
        ).map((recommendation) => recommendation.id);
        expect(ids).toEqual(expect.arrayContaining(["sdks", "docs", "docs-mcp", "cli"]));
    });

    it("recommends framework spec generation without SDKs when no spec exists", () => {
        const ids = recommend(
            detection({
                frameworks: [{ name: "fastapi", language: "python", canGenerateOpenApi: true }]
            })
        ).map((recommendation) => recommendation.id);
        expect(ids).toContain("spec-from-framework");
        expect(ids).not.toContain("sdks");
        expect(ids).not.toContain("cli");
    });

    it("recommends Mintlify migration and agent MCP", () => {
        const ids = recommend(
            detection({
                docsTools: [{ name: "mintlify", path: "mint.json" }],
                agents: ["cursor"]
            })
        ).map((recommendation) => recommendation.id);
        expect(ids).toEqual(expect.arrayContaining(["docs-migration", "agent-mcp"]));
    });
});
