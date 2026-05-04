import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { mkdtemp, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { loadRawDocsConfiguration } from "../loadDocsWorkspace.js";

describe("loadRawDocsConfiguration — translation locales", () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "fern-docs-yml-test-"));
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    async function writeDocsYml(contents: string): Promise<AbsoluteFilePath> {
        const docsYmlPath = path.join(tmpDir, "docs.yml") as AbsoluteFilePath;
        await writeFile(docsYmlPath, contents);
        return docsYmlPath;
    }

    it("accepts simple language codes (en, ja, fr)", async () => {
        const docsYmlPath = await writeDocsYml(
            `instances: []\ntranslations:\n  - lang: en\n    default: true\n  - lang: ja\n  - lang: fr\n`
        );
        const result = await loadRawDocsConfiguration({
            absolutePathOfConfiguration: docsYmlPath,
            context: createMockTaskContext()
        });
        expect(result.translations).toHaveLength(3);
    });

    it("accepts BCP 47 language tags with region subtags (ja-JP, pt-BR, zh-Hans-CN)", async () => {
        const docsYmlPath = await writeDocsYml(
            `instances: []\ntranslations:\n  - lang: en\n    default: true\n  - lang: ja-JP\n  - lang: pt-BR\n  - lang: zh-Hans-CN\n`
        );
        const result = await loadRawDocsConfiguration({
            absolutePathOfConfiguration: docsYmlPath,
            context: createMockTaskContext()
        });
        expect(result.translations).toHaveLength(4);
    });

    it("accepts BCP 47 codes in string-shorthand syntax", async () => {
        const docsYmlPath = await writeDocsYml(`instances: []\ntranslations:\n  - en-US\n  - ja-JP\n  - pt-BR\n`);
        const result = await loadRawDocsConfiguration({
            absolutePathOfConfiguration: docsYmlPath,
            context: createMockTaskContext()
        });
        expect(result.translations).toHaveLength(3);
    });

    it("accepts BCP 47 codes in the languages field", async () => {
        const docsYmlPath = await writeDocsYml(`instances: []\nlanguages:\n  - en\n  - ja-JP\n  - zh-Hans-CN\n`);
        const result = await loadRawDocsConfiguration({
            absolutePathOfConfiguration: docsYmlPath,
            context: createMockTaskContext()
        });
        expect(result.languages).toEqual(["en", "ja-JP", "zh-Hans-CN"]);
    });
});
