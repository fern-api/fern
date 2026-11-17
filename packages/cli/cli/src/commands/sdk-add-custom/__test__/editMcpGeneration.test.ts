import { describe, expect, it } from "vitest";
import { addMcpCustomCodeToSdkConfig } from "../editMcpGeneration.js";

const CONFIG_WITH_MCP = `schemaVersion: sdk-config/v1
sdkName: api
source:
  specs:
    - id: openapi
      type: openapi
      path: ./openapi.yml
targets:
  # keep this comment
  - language: mcp
    output:
      delivery: hosted
      slug: api
`;

describe("addMcpCustomCodeToSdkConfig", () => {
    it("adds a customTools entry under the mcp target and preserves comments", () => {
        const result = addMcpCustomCodeToSdkConfig({
            existingContents: CONFIG_WITH_MCP,
            edit: { kind: "tool", name: "query_balances", path: "custom/tools/query_balances.ts" },
            configPath: "sdk-config.yml",
            force: false
        });
        expect(result).toContain("customTools:");
        expect(result).toContain("query_balances:");
        expect(result).toContain("path: custom/tools/query_balances.ts");
        expect(result).toContain("# keep this comment");
    });

    it("adds a hooks entry under the mcp target", () => {
        const result = addMcpCustomCodeToSdkConfig({
            existingContents: CONFIG_WITH_MCP,
            edit: { kind: "hook", path: "custom/hooks.ts" },
            configPath: "sdk-config.yml",
            force: false
        });
        expect(result).toContain("hooks:");
        expect(result).toContain("path: custom/hooks.ts");
    });

    it("rejects a duplicate tool unless force is set", () => {
        const once = addMcpCustomCodeToSdkConfig({
            existingContents: CONFIG_WITH_MCP,
            edit: { kind: "tool", name: "query_balances", path: "custom/tools/query_balances.ts" },
            configPath: "sdk-config.yml",
            force: false
        });
        expect(() =>
            addMcpCustomCodeToSdkConfig({
                existingContents: once,
                edit: { kind: "tool", name: "query_balances", path: "custom/tools/query_balances.ts" },
                configPath: "sdk-config.yml",
                force: false
            })
        ).toThrow(/already configured/);
        // force overwrites without throwing
        expect(() =>
            addMcpCustomCodeToSdkConfig({
                existingContents: once,
                edit: { kind: "tool", name: "query_balances", path: "custom/tools/query_balances.ts" },
                configPath: "sdk-config.yml",
                force: true
            })
        ).not.toThrow();
    });

    it("fails clearly when there is no mcp target", () => {
        const noMcp = `schemaVersion: sdk-config/v1
sdkName: api
source:
  specs:
    - id: openapi
      type: openapi
      path: ./openapi.yml
targets:
  - language: typescript
    output:
      delivery: files
      path: ../out
`;
        expect(() =>
            addMcpCustomCodeToSdkConfig({
                existingContents: noMcp,
                edit: { kind: "hook", path: "custom/hooks.ts" },
                configPath: "sdk-config.yml",
                force: false
            })
        ).toThrow(/No `language: mcp` target/);
    });
});
