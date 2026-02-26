import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { mkdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { mergeWithOverrides } from "../loaders/mergeWithOverrides.js";
import { createMockTaskContext } from "./helpers/createMockTaskContext.js";

describe("mergeWithOverrides", () => {
    let tempDir: string;
    const context = createMockTaskContext();

    beforeEach(async () => {
        tempDir = join(tmpdir(), `merge-overrides-test-${Date.now()}`);
        await mkdir(tempDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(tempDir, { recursive: true, force: true });
    });

    it("merges a JSON override file into existing data", async () => {
        const overridePath = join(tempDir, "overrides.json");
        await writeFile(overridePath, JSON.stringify({ title: "Overridden Title" }));

        const result = await mergeWithOverrides({
            absoluteFilePathToOverrides: AbsoluteFilePath.of(overridePath),
            data: { title: "Original Title", version: "1.0.0" },
            context
        });

        expect(result.title).toBe("Overridden Title");
        expect(result.version).toBe("1.0.0");
    });

    it("merges a YAML override file into existing data", async () => {
        const overridePath = join(tempDir, "overrides.yml");
        await writeFile(overridePath, "title: Overridden Title\n");

        const result = await mergeWithOverrides({
            absoluteFilePathToOverrides: AbsoluteFilePath.of(overridePath),
            data: { title: "Original Title", version: "1.0.0" },
            context
        });

        expect(result.title).toBe("Overridden Title");
        expect(result.version).toBe("1.0.0");
    });

    it("removes null values from merged result", async () => {
        const overridePath = join(tempDir, "overrides.json");
        await writeFile(overridePath, JSON.stringify({ description: null }));

        const result = await mergeWithOverrides({
            absoluteFilePathToOverrides: AbsoluteFilePath.of(overridePath),
            data: { title: "Title", description: "A description" },
            context
        });

        expect(result.title).toBe("Title");
        expect("description" in result).toBe(false);
    });

    it("preserves null values under allowNullKeys", async () => {
        const overridePath = join(tempDir, "overrides.json");
        await writeFile(overridePath, JSON.stringify({ metadata: { deprecated: null } }));

        const result = await mergeWithOverrides({
            absoluteFilePathToOverrides: AbsoluteFilePath.of(overridePath),
            data: { title: "Title", metadata: { deprecated: "no" } },
            context,
            allowNullKeys: ["metadata"]
        });

        expect(result.title).toBe("Title");
        expect(result.metadata.deprecated).toBeNull();
    });

    it("deep-merges nested objects rather than replacing them", async () => {
        // Override sets a sibling key at the same nesting level as existing data.
        // lodash mergeWith does a recursive deep merge, so both keys should survive.
        const overridePath = join(tempDir, "overrides.json");
        await writeFile(overridePath, JSON.stringify({ foo: { bar: { newKey: "added" } } }));

        const result = await mergeWithOverrides({
            absoluteFilePathToOverrides: AbsoluteFilePath.of(overridePath),
            data: { foo: { bar: { existingKey: "original" } } },
            context
        });

        // Both the existing key and the new key from the override are present
        expect(result.foo.bar.existingKey).toBe("original");
        expect((result.foo.bar as Record<string, unknown>).newKey).toBe("added");
    });

    it("throws when the override file does not exist", async () => {
        const badPath = join(tempDir, "nonexistent.json");

        await expect(
            mergeWithOverrides({
                absoluteFilePathToOverrides: AbsoluteFilePath.of(badPath),
                data: { title: "Title" },
                context
            })
        ).rejects.toThrow("Failed to read overrides");
    });
});
