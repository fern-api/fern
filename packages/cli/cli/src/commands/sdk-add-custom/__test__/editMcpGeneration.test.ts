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

    it("accepts a document the strict whole-doc schema would reject (duplicate non-mcp languages)", () => {
        // Two typescript targets is a config the generation loader accepts (it validates per target);
        // validating the whole document would reject it. We only validate the mcp generation block.
        const twoTs = `schemaVersion: sdk-config/v1
sdkName: api
source:
  specs:
    - id: openapi
      type: openapi
      path: ./openapi.json
targets:
  - language: typescript
    output: { delivery: files, path: ../a }
  - language: typescript
    output: { delivery: files, path: ../b }
  - language: mcp
    output: { delivery: hosted, slug: api }
`;
        const result = addMcpCustomCodeToSdkConfig({
            existingContents: twoTs,
            edit: { kind: "hook", path: "custom/hooks.ts" },
            configPath: "sdk-config.yml",
            force: false
        });
        expect(result).toContain("hooks:");
        expect(result).toContain("path: custom/hooks.ts");
    });

    it("resolves an aliased generation block and inlines it on the mcp target", () => {
        // The mcp target's `generation` is a YAML alias of a shared anchor. We must resolve it, not reject.
        const aliased = `schemaVersion: sdk-config/v1
sdkName: api
source:
  specs:
    - id: openapi
      type: openapi
      path: ./openapi.json
generation: &shared
  serverName: fynapse
targets:
  - language: mcp
    output: { delivery: hosted, slug: api }
    generation: *shared
`;
        const result = addMcpCustomCodeToSdkConfig({
            existingContents: aliased,
            edit: { kind: "tool", name: "query_balances", path: "custom/tools/query_balances.ts" },
            configPath: "sdk-config.yml",
            force: false
        });
        // the alias is inlined (no longer `*shared` on the target) and carries both shared + new keys
        expect(result).not.toContain("generation: *shared");
        expect(result).toContain("serverName: fynapse");
        expect(result).toContain("query_balances:");
    });
});
