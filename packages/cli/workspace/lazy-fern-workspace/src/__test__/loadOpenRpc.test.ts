import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { mkdir, rm, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { tmpdir } from "os";
import { join } from "path";

import { loadOpenRpc } from "../utils/loadOpenRpc.js";
import { createMockTaskContext } from "./helpers/createMockTaskContext.js";

describe("loadOpenRpc", () => {
    let tempDir: string;
    const context = createMockTaskContext();

    const baseDocument = {
        openrpc: "1.0.0",
        info: { title: "Base RPC", version: "1.0.0" },
        methods: [
            {
                name: "getUser",
                params: [],
                result: { name: "user", schema: { type: "object" } }
            }
        ]
    };

    beforeEach(async () => {
        tempDir = join(tmpdir(), `load-openrpc-test-${Date.now()}`);
        await mkdir(tempDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(tempDir, { recursive: true, force: true });
    });

    it("loads a JSON document without overrides", async () => {
        const filePath = join(tempDir, "spec.json");
        await writeFile(filePath, JSON.stringify(baseDocument));

        const result = await loadOpenRpc({
            context,
            absoluteFilePath: AbsoluteFilePath.of(filePath),
            absoluteFilePathToOverrides: undefined
        });

        expect(result.info.title).toBe("Base RPC");
        expect(result.info.version).toBe("1.0.0");
        expect(result.methods).toHaveLength(1);
        // MethodOrReference union — use type guard for safe access
        const method = result.methods[0];
        expect(method).toBeDefined();
        expect(method != null && "name" in method && method.name).toBe("getUser");
    });

    it("loads a YAML document without overrides", async () => {
        const filePath = join(tempDir, "spec.yaml");
        await writeFile(filePath, yaml.dump(baseDocument));

        const result = await loadOpenRpc({
            context,
            absoluteFilePath: AbsoluteFilePath.of(filePath),
            absoluteFilePathToOverrides: undefined
        });

        expect(result.info.title).toBe("Base RPC");
        expect(result.info.version).toBe("1.0.0");
        expect(result.methods).toHaveLength(1);
        const method = result.methods[0];
        expect(method).toBeDefined();
        expect(method != null && "name" in method && method.name).toBe("getUser");
    });

    it("applies a single override", async () => {
        const filePath = join(tempDir, "spec.json");
        await writeFile(filePath, JSON.stringify(baseDocument));

        const overridePath = join(tempDir, "override.json");
        await writeFile(overridePath, JSON.stringify({ info: { title: "Overridden RPC" } }));

        const result = await loadOpenRpc({
            context,
            absoluteFilePath: AbsoluteFilePath.of(filePath),
            absoluteFilePathToOverrides: AbsoluteFilePath.of(overridePath)
        });

        expect(result.info.title).toBe("Overridden RPC");
        expect(result.info.version).toBe("1.0.0");
        expect(result.methods).toHaveLength(1);
    });

    it("applies multiple overrides sequentially", async () => {
        const filePath = join(tempDir, "spec.json");
        await writeFile(filePath, JSON.stringify(baseDocument));

        const overridePath1 = join(tempDir, "override1.json");
        await writeFile(overridePath1, JSON.stringify({ info: { title: "First Override" } }));

        const overridePath2 = join(tempDir, "override2.json");
        await writeFile(overridePath2, JSON.stringify({ info: { title: "Second Override" } }));

        const result = await loadOpenRpc({
            context,
            absoluteFilePath: AbsoluteFilePath.of(filePath),
            absoluteFilePathToOverrides: [AbsoluteFilePath.of(overridePath1), AbsoluteFilePath.of(overridePath2)]
        });

        expect(result.info.title).toBe("Second Override");
        expect(result.info.version).toBe("1.0.0");
        expect(result.methods).toHaveLength(1);
    });

    it("handles empty overrides array", async () => {
        const filePath = join(tempDir, "spec.json");
        await writeFile(filePath, JSON.stringify(baseDocument));

        const result = await loadOpenRpc({
            context,
            absoluteFilePath: AbsoluteFilePath.of(filePath),
            absoluteFilePathToOverrides: []
        });

        expect(result.info.title).toBe("Base RPC");
        expect(result.info.version).toBe("1.0.0");
        expect(result.methods).toHaveLength(1);
        const method = result.methods[0];
        expect(method).toBeDefined();
        expect(method != null && "name" in method && method.name).toBe("getUser");
    });
});
