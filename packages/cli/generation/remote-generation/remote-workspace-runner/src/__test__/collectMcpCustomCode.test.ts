import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { collectMcpCustomCode, extractMcpCustomCodeConfig } from "../collectMcpCustomCode.js";

describe("collectMcpCustomCode", () => {
    let root: AbsoluteFilePath;

    beforeEach(async () => {
        root = AbsoluteFilePath.of(
            await mkdtemp(join(AbsoluteFilePath.of(tmpdir()), RelativeFilePath.of("mcp-custom-code-")))
        );
        await mkdir(join(root, RelativeFilePath.of("custom/tools")), { recursive: true });
        await writeFile(join(root, RelativeFilePath.of("custom/hooks.ts")), "export async function beforeRequest() {}");
        await writeFile(
            join(root, RelativeFilePath.of("custom/tools/query_balances.ts")),
            "export const definition = {}; export const handler = async () => ({});"
        );
    });

    afterEach(async () => {
        await rm(root, { recursive: true, force: true });
    });

    // yazl writes each entry's name into its local file header uncompressed (UTF-8), so entry names
    // are recoverable from the raw bytes without a full unzip.
    function containsEntry(buffer: Buffer, name: string): boolean {
        return buffer.includes(Buffer.from(name, "utf8"));
    }

    it("packages the hook + custom tools under mcp/ with the generator's layout", async () => {
        const buffer = await collectMcpCustomCode(
            {
                hooks: { path: "custom/hooks.ts" },
                customTools: { query_balances: { path: "custom/tools/query_balances.ts" } }
            },
            root
        );
        if (buffer == null) {
            throw new Error("expected a zip buffer");
        }
        expect(buffer.subarray(0, 2).toString("latin1")).toBe("PK"); // local-file-header magic
        expect(containsEntry(buffer, "mcp/custom-hook.ts")).toBe(true);
        expect(containsEntry(buffer, "mcp/custom/tools/query_balances.ts")).toBe(true);
    });

    it("packages only the hook when no custom tools are declared", async () => {
        const buffer = await collectMcpCustomCode({ hooks: { path: "custom/hooks.ts" } }, root);
        if (buffer == null) {
            throw new Error("expected a zip buffer");
        }
        expect(containsEntry(buffer, "mcp/custom-hook.ts")).toBe(true);
        expect(containsEntry(buffer, "mcp/custom/tools/query_balances.ts")).toBe(false);
    });

    it("returns undefined when the target declares no custom code", async () => {
        expect(await collectMcpCustomCode({}, root)).toBeUndefined();
    });
});

describe("extractMcpCustomCodeConfig", () => {
    it("returns an empty config for non-object input", () => {
        expect(extractMcpCustomCodeConfig(undefined)).toEqual({});
        expect(extractMcpCustomCodeConfig(null)).toEqual({});
        expect(extractMcpCustomCodeConfig("nope")).toEqual({});
        expect(extractMcpCustomCodeConfig(42)).toEqual({});
    });

    it("extracts a hooks path", () => {
        expect(extractMcpCustomCodeConfig({ hooks: { path: "custom/hooks.ts" } })).toEqual({
            hooks: { path: "custom/hooks.ts" }
        });
    });

    it("ignores a hooks entry without a string path", () => {
        expect(extractMcpCustomCodeConfig({ hooks: {} })).toEqual({});
        expect(extractMcpCustomCodeConfig({ hooks: { path: 7 } })).toEqual({});
        expect(extractMcpCustomCodeConfig({ hooks: "custom/hooks.ts" })).toEqual({});
    });

    it("extracts customTools entries and drops invalid ones", () => {
        expect(
            extractMcpCustomCodeConfig({
                customTools: {
                    query_balances: { path: "custom/tools/query_balances.ts" },
                    bad: { path: 3 },
                    alsoBad: "nope"
                }
            })
        ).toEqual({ customTools: { query_balances: { path: "custom/tools/query_balances.ts" } } });
    });

    it("omits customTools when no entry is valid", () => {
        expect(extractMcpCustomCodeConfig({ customTools: { bad: {} } })).toEqual({});
        expect(extractMcpCustomCodeConfig({ customTools: {} })).toEqual({});
    });

    it("extracts hooks + customTools together and ignores unrelated keys", () => {
        expect(
            extractMcpCustomCodeConfig({
                serverName: "fynapse",
                mergedTools: { update_configuration: {} },
                hooks: { path: "custom/hooks.ts" },
                customTools: { query_journals: { path: "custom/tools/query_journals.ts" } }
            })
        ).toEqual({
            hooks: { path: "custom/hooks.ts" },
            customTools: { query_journals: { path: "custom/tools/query_journals.ts" } }
        });
    });
});
