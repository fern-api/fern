import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { mkdtemp, rm, writeFile } from "fs/promises";
import yaml from "js-yaml";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { loadRawDocsConfiguration } from "../loadDocsWorkspace.js";

interface NavNode {
    page?: string;
    section?: string;
    path: string;
    contents?: NavNode[];
}

function buildSection(depth: number, width: number, name: string): NavNode {
    if (depth === 0) {
        return { page: `${name} leaf`, path: `./pages/${name}.mdx` };
    }
    return {
        section: `Section ${name}`,
        path: `./pages/${name}.mdx`,
        contents: Array.from({ length: width }, (_, i) => buildSection(depth - 1, width, `${name}-${i}`))
    };
}

describe("loadRawDocsConfiguration — large tabbed navigation", () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "fern-docs-yml-tabs-test-"));
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    it("parses a deeply nested tab layout without overflowing the stack", async () => {
        const docsYmlPath = path.join(tmpDir, "docs.yml") as AbsoluteFilePath;
        await writeFile(
            docsYmlPath,
            yaml.dump({
                instances: [],
                tabs: { main: { "display-name": "Main", "skip-slug": true } },
                navigation: [{ tab: "main", layout: [buildSection(7, 3, "t")] }]
            })
        );
        const result = await loadRawDocsConfiguration({
            absolutePathOfConfiguration: docsYmlPath,
            context: createMockTaskContext()
        });
        expect(result.navigation).toHaveLength(1);
    }, 60_000);
});
