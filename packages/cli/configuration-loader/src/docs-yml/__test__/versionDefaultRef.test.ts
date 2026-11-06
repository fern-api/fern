import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { execFileSync } from "child_process";
import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join as pathJoin } from "path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { parseDocsConfiguration } from "../parseDocsConfiguration.js";

const context = createMockTaskContext();

function git(cwd: string, ...args: string[]): string {
    return execFileSync("git", args, {
        cwd,
        encoding: "utf-8",
        env: {
            ...process.env,
            GIT_AUTHOR_NAME: "test",
            GIT_AUTHOR_EMAIL: "test@example.com",
            GIT_COMMITTER_NAME: "test",
            GIT_COMMITTER_EMAIL: "test@example.com"
        }
    }).trim();
}

async function write(repo: string, relativePath: string, contents: string): Promise<void> {
    const absolute = pathJoin(repo, relativePath);
    await mkdir(pathJoin(absolute, ".."), { recursive: true });
    await writeFile(absolute, contents);
}

const DEVELOP_DOCS_YML =
    "instances: []\nnavigation:\n  - section: Guides\n    contents:\n      - page: Getting started\n        path: ./pages/develop.mdx\n";
const RELEASE_VERSION_YML =
    "navigation:\n  - section: Guides\n    contents:\n      - page: Getting started\n        path: ../pages/release.mdx\n";

describe("version `default: true` on a git-ref-backed version", () => {
    let repo: string;
    let fernFolder: AbsoluteFilePath;

    beforeAll(async () => {
        repo = await mkdtemp(pathJoin(tmpdir(), "version-default-ref-"));
        git(repo, "init", "-b", "main");
        await write(repo, "fern/docs.yml", DEVELOP_DOCS_YML);
        await write(repo, "fern/pages/develop.mdx", "# Develop\n");
        git(repo, "add", "-A");
        git(repo, "commit", "-m", "develop docs");
        git(repo, "branch", "develop");

        await write(repo, "fern/docs.yml", "instances: []\n");
        await write(repo, "fern/versions/release.yml", RELEASE_VERSION_YML);
        await write(repo, "fern/pages/release.mdx", "# 3.3.0\n");
        git(repo, "add", "-A");
        git(repo, "commit", "-m", "release docs");
        fernFolder = join(AbsoluteFilePath.of(repo), RelativeFilePath.of("fern"));
    });

    afterAll(async () => {
        await rm(repo, { recursive: true, force: true });
    });

    function parse(versions: unknown[], buildRefVersions: boolean) {
        return parseDocsConfiguration({
            rawDocsConfiguration: docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow({
                instances: [],
                versions
            }),
            absolutePathToFernFolder: fernFolder,
            absoluteFilepathToDocsConfig: join(fernFolder, RelativeFilePath.of("docs.yml")),
            context,
            buildRefVersions
        });
    }

    it("builds a `ref:` version marked `default: true`", async () => {
        const parsed = await parse(
            [
                { "display-name": "3.3.0", path: "./versions/release.yml" },
                { "display-name": "Develop", ref: "develop", default: true }
            ],
            true
        );
        if (parsed.navigation.type !== "versioned") {
            throw new Error("Expected versioned navigation");
        }
        expect(parsed.navigation.versions.map((version) => [version.version, version.default])).toEqual([
            ["3.3.0", undefined],
            ["Develop", true]
        ]);
        expect(parsed.navigation.versions[1]?.contentSource).toBeDefined();
    });

    it("validates against the raw list when git-ref-backed versions are skipped", async () => {
        // The hidden working-tree version is not the default, even though it is the only one built.
        const parsed = await parse(
            [
                { "display-name": "Develop", ref: "develop", default: true },
                { "display-name": "3.3.0", path: "./versions/release.yml", hidden: true }
            ],
            false
        );
        if (parsed.navigation.type !== "versioned") {
            throw new Error("Expected versioned navigation");
        }
        expect(parsed.navigation.versions.map((version) => version.version)).toEqual(["3.3.0"]);
    });

    it("rejects a hidden `ref:` default even when git-ref-backed versions are skipped", async () => {
        await expect(
            parse(
                [
                    { "display-name": "3.3.0", path: "./versions/release.yml" },
                    { "display-name": "Develop", ref: "develop", default: true, hidden: true }
                ],
                false
            )
        ).rejects.toThrow("The default version 'Develop' cannot be hidden.");
    });
});
