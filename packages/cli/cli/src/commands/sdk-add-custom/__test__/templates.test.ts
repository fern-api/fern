import { describe, expect, it } from "vitest";
import { customToolModule, customToolRelativePath, hookModule, hookRelativePath } from "../templates.js";

describe("scaffold templates", () => {
    it("emits a custom tool that imports the authoring contract and uses context.fetch", () => {
        const module = customToolModule("query_balances");
        expect(module).toContain('from "@fern-api/mcp-tooling"');
        expect(module).toContain('name: "query_balances"');
        expect(module).toContain('title: "Query Balances"');
        expect(module).toContain("context.fetch(");
        expect(module).toContain("export const definition: ToolDefinition");
        expect(module).toContain("export const handler");
    });

    it("emits a hooks module with the four hook exports", () => {
        const module = hookModule();
        expect(module).toContain('from "@fern-api/mcp-tooling"');
        expect(module).toContain("export async function beforeRequest");
        expect(module).toContain("export async function afterResponse");
        expect(module).toContain("export async function onError");
        expect(module).toContain("export async function transformResult");
    });

    it("places modules under fern/custom", () => {
        expect(customToolRelativePath("query_balances")).toBe("custom/tools/query_balances.ts");
        expect(hookRelativePath()).toBe("custom/hooks.ts");
    });
});
