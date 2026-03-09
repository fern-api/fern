import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { randomUUID } from "crypto";
import { realpathSync } from "fs";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FernYmlApiEditor } from "../fernYmlApiEditor.js";

let testDir: string;
let fernYmlPath: string;
let specFilePath: AbsoluteFilePath;

beforeEach(async () => {
    testDir = path.join(realpathSync(tmpdir()), `fern-yml-editor-test-${randomUUID()}`);
    await mkdir(testDir, { recursive: true });
    fernYmlPath = path.join(testDir, "fern.yml");
    specFilePath = AbsoluteFilePath.of(path.join(testDir, "openapi.yml"));
});

afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
});

async function writeFernYml(content: string): Promise<void> {
    await writeFile(fernYmlPath, content);
}

async function readFernYml(): Promise<string> {
    return readFile(fernYmlPath, "utf8");
}

describe("FernYmlApiEditor — inline api section", () => {
    it("adds override to spec with no existing overrides", async () => {
        await writeFernYml(`api:
  specs:
    - openapi: ./openapi.yml
`);

        const editor = await FernYmlApiEditor.load(AbsoluteFilePath.of(testDir));
        const overridePath = AbsoluteFilePath.of(path.join(testDir, "openapi-overrides.yml"));
        editor.addOverride(specFilePath, overridePath);
        await editor.save();

        const result = await readFernYml();
        expect(result).toContain("overrides: ./openapi-overrides.yml");
    });

    it("converts single override to array when adding second", async () => {
        await writeFernYml(`api:
  specs:
    - openapi: ./openapi.yml
      overrides: ./overrides-1.yml
`);

        const editor = await FernYmlApiEditor.load(AbsoluteFilePath.of(testDir));
        const overridePath = AbsoluteFilePath.of(path.join(testDir, "overrides-2.yml"));
        editor.addOverride(specFilePath, overridePath);
        await editor.save();

        const result = await readFernYml();
        expect(result).toContain("overrides-1.yml");
        expect(result).toContain("overrides-2.yml");
    });

    it("appends to existing array of overrides", async () => {
        await writeFernYml(`api:
  specs:
    - openapi: ./openapi.yml
      overrides:
        - ./overrides-1.yml
        - ./overrides-2.yml
`);

        const editor = await FernYmlApiEditor.load(AbsoluteFilePath.of(testDir));
        const overridePath = AbsoluteFilePath.of(path.join(testDir, "overrides-3.yml"));
        editor.addOverride(specFilePath, overridePath);
        await editor.save();

        const result = await readFernYml();
        expect(result).toContain("overrides-1.yml");
        expect(result).toContain("overrides-2.yml");
        expect(result).toContain("overrides-3.yml");
    });

    it("does not duplicate existing override", async () => {
        await writeFernYml(`api:
  specs:
    - openapi: ./openapi.yml
      overrides: ./openapi-overrides.yml
`);

        const editor = await FernYmlApiEditor.load(AbsoluteFilePath.of(testDir));
        const overridePath = AbsoluteFilePath.of(path.join(testDir, "openapi-overrides.yml"));
        const mutated = editor.addOverride(specFilePath, overridePath);

        expect(mutated).toBe(false);
    });

    it("returns false when no specs array", async () => {
        await writeFernYml(`api:
  auth: bearer
`);

        const editor = await FernYmlApiEditor.load(AbsoluteFilePath.of(testDir));
        const overridePath = AbsoluteFilePath.of(path.join(testDir, "overrides.yml"));
        const mutated = editor.addOverride(specFilePath, overridePath);

        expect(mutated).toBe(false);
    });

    it("removes single override reference", async () => {
        await writeFernYml(`api:
  specs:
    - openapi: ./openapi.yml
      overrides: ./overrides.yml
`);

        const editor = await FernYmlApiEditor.load(AbsoluteFilePath.of(testDir));
        const removed = editor.removeOverrides(specFilePath);
        await editor.save();

        const result = await readFernYml();
        expect(result).not.toContain("overrides");
        expect(removed).toEqual(["./overrides.yml"]);
    });

    it("removes array of overrides", async () => {
        await writeFernYml(`api:
  specs:
    - openapi: ./openapi.yml
      overrides:
        - ./a.yml
        - ./b.yml
`);

        const editor = await FernYmlApiEditor.load(AbsoluteFilePath.of(testDir));
        const removed = editor.removeOverrides(specFilePath);
        await editor.save();

        const result = await readFernYml();
        expect(result).not.toContain("overrides");
        expect(removed).toEqual(["./a.yml", "./b.yml"]);
    });

    it("returns empty array when no overrides exist", async () => {
        await writeFernYml(`api:
  specs:
    - openapi: ./openapi.yml
`);

        const editor = await FernYmlApiEditor.load(AbsoluteFilePath.of(testDir));
        const removed = editor.removeOverrides(specFilePath);
        expect(removed).toEqual([]);
    });

    it("only removes overrides for matching spec", async () => {
        await writeFernYml(`api:
  specs:
    - openapi: ./openapi.yml
      overrides: ./overrides-a.yml
    - openapi: ./other.yml
      overrides: ./overrides-b.yml
`);

        const editor = await FernYmlApiEditor.load(AbsoluteFilePath.of(testDir));
        editor.removeOverrides(specFilePath);
        await editor.save();

        const result = await readFernYml();
        expect(result).toContain("overrides-b.yml");
        expect(result).not.toContain("overrides-a.yml");
    });

    it("does not write file when no mutations were made", async () => {
        await writeFernYml(`api:
  specs:
    - openapi: ./openapi.yml
`);
        const original = await readFernYml();

        const editor = await FernYmlApiEditor.load(AbsoluteFilePath.of(testDir));
        await editor.save();

        const after = await readFernYml();
        expect(after).toBe(original);
    });
});

describe("FernYmlApiEditor — $ref api section", () => {
    it("edits the referenced file when api uses $ref", async () => {
        const apiYmlPath = path.join(testDir, "api.yml");
        await writeFernYml(`api:
  $ref: ./api.yml
`);
        await writeFile(
            apiYmlPath,
            `specs:
  - openapi: ./openapi.yml
`
        );

        const editor = await FernYmlApiEditor.load(AbsoluteFilePath.of(testDir));
        const overridePath = AbsoluteFilePath.of(path.join(testDir, "openapi-overrides.yml"));
        editor.addOverride(specFilePath, overridePath);
        await editor.save();

        // fern.yml should be unchanged
        const fernContent = await readFernYml();
        expect(fernContent).toContain("$ref: ./api.yml");

        // api.yml should have the override added
        const apiContent = await readFile(apiYmlPath, "utf8");
        expect(apiContent).toContain("overrides: ./openapi-overrides.yml");
    });

    it("removes overrides from the referenced file", async () => {
        const apiYmlPath = path.join(testDir, "api.yml");
        await writeFernYml(`api:
  $ref: ./api.yml
`);
        await writeFile(
            apiYmlPath,
            `specs:
  - openapi: ./openapi.yml
    overrides: ./overrides.yml
`
        );

        const editor = await FernYmlApiEditor.load(AbsoluteFilePath.of(testDir));
        const removed = editor.removeOverrides(specFilePath);
        await editor.save();

        expect(removed).toEqual(["./overrides.yml"]);
        const apiContent = await readFile(apiYmlPath, "utf8");
        expect(apiContent).not.toContain("overrides");
    });
});
