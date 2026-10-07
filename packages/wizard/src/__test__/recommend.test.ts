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
        hasPackageJson: false,
        pnpmWorkspaceRoot: false,
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

    it("cites the OpenAPI spec when other formats sort first", () => {
        const recommendations = recommend(
            detection({
                apiSpecs: [
                    { path: "proto/user.proto", format: "protobuf" },
                    { path: "specs/openapi.yaml", format: "openapi", version: "3.1.0" }
                ]
            })
        );
        expect(recommendations.find((recommendation) => recommendation.id === "sdks")?.why).toBe(
            "Found specs/openapi.yaml (OpenAPI 3.1.0)"
        );
    });

    it("does not recommend SDKs or the CLI generator from non-OpenAPI specs alone", () => {
        const recommendations = recommend(
            detection({ apiSpecs: [{ path: "asyncapi.yaml", format: "asyncapi", version: "2.6.0" }] })
        );
        const ids = recommendations.map((recommendation) => recommendation.id);
        expect(ids).not.toContain("sdks");
        expect(ids).not.toContain("cli");
        expect(recommendations.find((recommendation) => recommendation.id === "docs")?.why).toBe(
            "Found AsyncAPI definition at asyncapi.yaml"
        );
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
