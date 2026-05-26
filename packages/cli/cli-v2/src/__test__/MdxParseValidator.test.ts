import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { NOOP_LOGGER } from "@fern-api/logger";

import { randomUUID } from "crypto";
import { mkdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { loadFernYml } from "../config/fern-yml/loadFernYml.js";
import { DocsChecker } from "../docs/checker/DocsChecker.js";
import type { Workspace } from "../workspace/Workspace.js";
import { WorkspaceLoader } from "../workspace/WorkspaceLoader.js";
import { createTestContext } from "./utils/createTestContext.js";

describe("MdxParseValidator (via DocsChecker)", () => {
    let testDir: AbsoluteFilePath;

    beforeEach(async () => {
        testDir = AbsoluteFilePath.of(join(tmpdir(), `fern-mdx-parse-test-${randomUUID()}`));
        await mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    it("emits an MdxParseError for a JSX-attribute-needs-braces page", async () => {
        await mkdir(join(testDir, "pages"), { recursive: true });
        await writeFile(
            join(testDir, "pages", "broken.mdx"),
            `---
title: Broken
---

<MyComponent
  label="hello"
  icon=<Icon name="star" />
/>
`
        );
        await writeWorkspace(testDir, { pagePath: "./pages/broken.mdx", pageTitle: "Broken" });

        const result = await runDocsChecker(testDir);

        expect(result.mdxParseErrors.length).toBeGreaterThanOrEqual(1);
        const first = result.mdxParseErrors[0];
        expect(first).toBeDefined();
        if (first == null) {
            return;
        }
        expect(first.code.code).toBe("E0301");
        expect(first.displayRelativeFilepath.endsWith("broken.mdx")).toBe(true);
        // Frontmatter (`---\ntitle\n---\n` = 3 lines + blank = 4) shifts the
        // error reported by the parser. Make sure the line is somewhere in
        // our component definition (lines 5-8 in the file above).
        expect(first.line).toBeGreaterThanOrEqual(5);
        // Should pick up the content of the offending line for fix suggestions.
        expect(first.sourceLines.some((l) => l.isErrorLine)).toBe(true);
    });

    it("returns no MdxParseErrors for a valid page", async () => {
        await mkdir(join(testDir, "pages"), { recursive: true });
        await writeFile(
            join(testDir, "pages", "ok.mdx"),
            `---
title: OK
---

# Hello

This is a valid page.
`
        );
        await writeWorkspace(testDir, { pagePath: "./pages/ok.mdx", pageTitle: "OK" });

        const result = await runDocsChecker(testDir);

        expect(result.mdxParseErrors).toHaveLength(0);
    });

    it("flags the docs check as having errors when MDX parse fails", async () => {
        await mkdir(join(testDir, "pages"), { recursive: true });
        await writeFile(
            join(testDir, "pages", "broken.mdx"),
            `---
title: Bad
---

<MyComponent icon=<Icon /> />
`
        );
        await writeWorkspace(testDir, { pagePath: "./pages/broken.mdx", pageTitle: "Bad" });

        const result = await runDocsChecker(testDir);
        expect(result.hasErrors).toBe(true);
        expect(result.errorCount).toBeGreaterThanOrEqual(result.mdxParseErrors.length);
    });
});

async function runDocsChecker(testDir: AbsoluteFilePath): Promise<DocsChecker.Result> {
    const workspace = await loadTempWorkspace(testDir);
    const checker = new DocsChecker({
        context: await createTestContext({ cwd: testDir })
    });
    return checker.check({ workspace });
}

async function loadTempWorkspace(cwd: AbsoluteFilePath): Promise<Workspace> {
    const fernYml = await loadFernYml({ cwd });
    const loader = new WorkspaceLoader({ cwd, logger: NOOP_LOGGER });
    const result = await loader.load({ fernYml });
    if (!result.success) {
        throw new Error(`Failed to load workspace: ${JSON.stringify(result.issues)}`);
    }
    return result.workspace;
}

async function writeWorkspace(
    dir: AbsoluteFilePath,
    { pagePath, pageTitle }: { pagePath: string; pageTitle: string }
): Promise<void> {
    await writeFile(
        join(dir, "fern.yml"),
        `
edition: 2026-01-01
org: acme
api:
  specs:
    - openapi: openapi.yml
docs:
  instances:
    - url: acme.docs.buildwithfern.com
  navigation:
    - page: ${pageTitle}
      path: ${pagePath}
`
    );
    await writeFile(
        join(dir, "openapi.yml"),
        `
openapi: 3.0.0
info:
  title: Test
  version: 1.0.0
paths: {}
`
    );
}
