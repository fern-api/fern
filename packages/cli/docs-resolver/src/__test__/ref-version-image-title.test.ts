import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { execFileSync } from "child_process";
import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { DocsDefinitionResolver } from "../DocsDefinitionResolver.js";

const context = createMockTaskContext();

function git(cwd: string, ...args: string[]): void {
    execFileSync("git", args, {
        cwd,
        env: {
            ...process.env,
            GIT_AUTHOR_NAME: "test",
            GIT_AUTHOR_EMAIL: "test@example.com",
            GIT_COMMITTER_NAME: "test",
            GIT_COMMITTER_EMAIL: "test@example.com"
        }
    });
}

async function write(root: string, relativePath: string, contents: string): Promise<void> {
    const absolute = join(root, relativePath);
    await mkdir(join(absolute, ".."), { recursive: true });
    await writeFile(absolute, contents);
}

const TITLED_IMAGE = '![Diagram](../assets/diagram.png "Flow: 1) Input, 2) Output")';

describe("git-ref-backed version with an image title containing `)`", () => {
    let repo: string;

    beforeAll(async () => {
        repo = await mkdtemp(join(tmpdir(), "ref-image-title-"));
        git(repo, "init", "-b", "main");
        await write(repo, "fern/fern.config.json", JSON.stringify({ organization: "test", version: "0.0.0" }));
        await write(
            repo,
            "fern/docs.yml",
            "instances: []\nnavigation:\n  - page: Overview\n    path: ./pages/overview.mdx\n"
        );
        await write(repo, "fern/pages/overview.mdx", `# Snapshot\n\n${TITLED_IMAGE}\n`);
        await write(repo, "fern/assets/diagram.png", "png");
        git(repo, "add", "-A");
        git(repo, "commit", "-m", "snapshot");
        git(repo, "tag", "docs-snapshot-v1");

        await write(
            repo,
            "fern/docs.yml",
            "instances: []\nversions:\n  - display-name: Latest\n    path: ./versions/latest.yml\n  - display-name: v1\n    ref: docs-snapshot-v1\n"
        );
        await write(repo, "fern/versions/latest.yml", "navigation:\n  - page: Home\n    path: ../pages/home.mdx\n");
        await write(repo, "fern/pages/home.mdx", "# Latest\n");
        await write(repo, "fern/pages/overview.mdx", "# Rewritten without the image\n");
        git(repo, "add", "-A");
        git(repo, "commit", "-m", "latest");
    });

    afterAll(async () => {
        await rm(repo, { recursive: true, force: true });
    });

    it("uploads the image from the ref and swaps in its file ID, keeping the title", async () => {
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: AbsoluteFilePath.of(join(repo, "fern")),
            context
        });
        if (docsWorkspace == null) {
            throw new Error("Failed to load docs workspace");
        }

        const uploaded: string[] = [];
        const resolver = new DocsDefinitionResolver({
            domain: "https://example.com",
            docsWorkspace,
            ossWorkspaces: [],
            apiWorkspaces: [],
            taskContext: context,
            uploadFiles: (files) =>
                files.map((file) => {
                    uploaded.push(file.absoluteFilePath);
                    return { ...file, fileId: "diagram-id" };
                }),
            registerApi: async () => ""
        });

        const definition = await resolver.resolve();

        const imageUploads = uploaded.filter((path) => path.includes("diagram"));
        expect(imageUploads).toHaveLength(1);
        expect(imageUploads[0]).toMatch(/\/assets\/diagram\.png$/);

        const refPage = Object.values(definition.pages).find((page) => page?.markdown.includes("Snapshot"));
        expect(refPage?.markdown).toContain('![Diagram](file:diagram-id "Flow: 1) Input, 2) Output")');
    });
});
