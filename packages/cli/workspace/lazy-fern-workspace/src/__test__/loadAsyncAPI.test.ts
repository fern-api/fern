import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { mkdir, rm, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { tmpdir } from "os";
import { join } from "path";

import { loadAsyncAPI } from "../utils/loadAsyncAPI.js";
import { createMockTaskContext } from "./helpers/createMockTaskContext.js";

// loadAsyncAPI returns DocumentV2 | DocumentV3; our fixtures are plain objects
// that don't perfectly match either union member. Cast through unknown for field access.
interface AsyncAPIResult {
    asyncapi: string;
    info: Record<string, unknown>;
    channels: Record<string, unknown>;
}

const BASE_DOC = {
    asyncapi: "2.6.0",
    info: {
        title: "Base API",
        version: "1.0.0"
    },
    channels: {
        "/events": {
            publish: {
                operationId: "publishEvent"
            }
        }
    }
};

describe("loadAsyncAPI", () => {
    let tempDir: string;
    const context = createMockTaskContext();

    beforeEach(async () => {
        tempDir = join(tmpdir(), `load-asyncapi-test-${Date.now()}`);
        await mkdir(tempDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(tempDir, { recursive: true, force: true });
    });

    it("loads document without overrides", async () => {
        const basePath = join(tempDir, "asyncapi.yml");
        await writeFile(basePath, yaml.dump(BASE_DOC));

        const raw = await loadAsyncAPI({
            context,
            absoluteFilePath: AbsoluteFilePath.of(basePath),
            absoluteFilePathToOverrides: undefined
        });
        const result = raw as unknown as AsyncAPIResult;

        expect(result.asyncapi).toBe("2.6.0");
        expect(result.info.title).toBe("Base API");
        expect(result.info.version).toBe("1.0.0");
        expect(result.channels).toHaveProperty("/events");
    });

    it("applies a single override string", async () => {
        const basePath = join(tempDir, "asyncapi.yml");
        await writeFile(basePath, yaml.dump(BASE_DOC));

        const overridePath = join(tempDir, "override.yml");
        await writeFile(overridePath, yaml.dump({ info: { title: "Overridden API" } }));

        const raw = await loadAsyncAPI({
            context,
            absoluteFilePath: AbsoluteFilePath.of(basePath),
            absoluteFilePathToOverrides: AbsoluteFilePath.of(overridePath)
        });
        const result = raw as unknown as AsyncAPIResult;

        expect(result.info.title).toBe("Overridden API");
        expect(result.info.version).toBe("1.0.0");
    });

    it("applies multiple overrides sequentially", async () => {
        const basePath = join(tempDir, "asyncapi.yml");
        await writeFile(basePath, yaml.dump(BASE_DOC));

        const override1Path = join(tempDir, "override1.yml");
        await writeFile(
            override1Path,
            yaml.dump({ info: { title: "First Override", description: "Added by first override" } })
        );

        const override2Path = join(tempDir, "override2.yml");
        await writeFile(override2Path, yaml.dump({ info: { title: "Second Override", contact: { name: "Support" } } }));

        const raw = await loadAsyncAPI({
            context,
            absoluteFilePath: AbsoluteFilePath.of(basePath),
            absoluteFilePathToOverrides: [AbsoluteFilePath.of(override1Path), AbsoluteFilePath.of(override2Path)]
        });
        const result = raw as unknown as AsyncAPIResult;

        expect(result.info.title).toBe("Second Override");
        expect(result.info.description).toBe("Added by first override");
        expect(result.info.contact).toEqual({ name: "Support" });
        expect(result.info.version).toBe("1.0.0");
    });

    it("preserves order: later overrides take precedence", async () => {
        const basePath = join(tempDir, "asyncapi.yml");
        await writeFile(basePath, yaml.dump(BASE_DOC));

        const override1Path = join(tempDir, "override1.yml");
        await writeFile(override1Path, yaml.dump({ info: { version: "2.0.0" } }));

        const override2Path = join(tempDir, "override2.yml");
        await writeFile(override2Path, yaml.dump({ info: { version: "3.0.0" } }));

        const raw = await loadAsyncAPI({
            context,
            absoluteFilePath: AbsoluteFilePath.of(basePath),
            absoluteFilePathToOverrides: [AbsoluteFilePath.of(override1Path), AbsoluteFilePath.of(override2Path)]
        });
        const result = raw as unknown as AsyncAPIResult;

        expect(result.info.version).toBe("3.0.0");
        expect(result.info.title).toBe("Base API");
    });

    it("later override setting parent key deep-merges with child keys from earlier override", async () => {
        // Override 1 sets a deep nested key: channels./events.publish.description = "from first"
        // Override 2 sets the parent: channels./events.publish = { summary: "from second" }
        // Because lodash mergeWith does recursive deep merge, both keys should survive.
        const basePath = join(tempDir, "asyncapi.yml");
        await writeFile(basePath, yaml.dump(BASE_DOC));

        const override1Path = join(tempDir, "override1.yml");
        await writeFile(
            override1Path,
            yaml.dump({
                channels: { "/events": { publish: { description: "from first" } } }
            })
        );

        const override2Path = join(tempDir, "override2.yml");
        await writeFile(
            override2Path,
            yaml.dump({
                channels: { "/events": { publish: { summary: "from second" } } }
            })
        );

        const raw = await loadAsyncAPI({
            context,
            absoluteFilePath: AbsoluteFilePath.of(basePath),
            absoluteFilePathToOverrides: [AbsoluteFilePath.of(override1Path), AbsoluteFilePath.of(override2Path)]
        });
        const result = raw as unknown as AsyncAPIResult;
        const publish = (result.channels as Record<string, Record<string, Record<string, unknown>>>)["/events"]
            ?.publish;

        // Deep merge: all three keys coexist (original operationId + override1 description + override2 summary)
        expect(publish?.operationId).toBe("publishEvent");
        expect(publish?.description).toBe("from first");
        expect(publish?.summary).toBe("from second");
    });

    it("handles empty overrides array", async () => {
        const basePath = join(tempDir, "asyncapi.yml");
        await writeFile(basePath, yaml.dump(BASE_DOC));

        const raw = await loadAsyncAPI({
            context,
            absoluteFilePath: AbsoluteFilePath.of(basePath),
            absoluteFilePathToOverrides: []
        });
        const result = raw as unknown as AsyncAPIResult;

        expect(result.asyncapi).toBe("2.6.0");
        expect(result.info.title).toBe("Base API");
        expect(result.info.version).toBe("1.0.0");
        expect(result.channels).toHaveProperty("/events");
    });
});
