import { describe, expect, it } from "vitest";
import type { CallToolResult, RequestContext, ToolArgs, ToolDefinition, ToolHandler } from "../index.js";

// These `satisfies` checks are the real guard: `tsc` (the package's compile step) fails if the exported
// authoring types drift from the shape a scaffolded custom tool / hook is written against.
describe("@fern-api/mcp-tooling contract", () => {
    it("types a custom tool the way the scaffold emits it", () => {
        const definition = {
            name: "query_balances",
            title: "Query balances",
            description: "Query general-ledger balances.",
            inputSchema: { type: "object", properties: {}, additionalProperties: false },
            annotations: {}
        } satisfies ToolDefinition;

        const handler: ToolHandler = async (args: ToolArgs, context: RequestContext): Promise<CallToolResult> => {
            // The sanctioned outbound call the scaffold teaches.
            const response = await context.fetch(`${context.baseUrl}/balances/query`, {
                method: "POST",
                body: JSON.stringify(args)
            });
            return { content: [{ type: "text", text: await response.text() }] };
        };

        expect(definition.name).toBe("query_balances");
        expect(typeof handler).toBe("function");
    });
});
