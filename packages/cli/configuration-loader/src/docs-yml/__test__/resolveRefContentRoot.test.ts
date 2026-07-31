import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { mkdir, mkdtemp, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join as pathJoin } from "path";
import { afterEach, describe, expect, it } from "vitest";

import { MaterializedGitRef } from "../git-versions/materializeGitRef.js";
import { resolveRefContentRoot } from "../git-versions/resolveRefContentRoot.js";

const context = createMockTaskContext();

describe("resolveRefContentRoot", () => {
    let fernFolders: string[] = [];

    afterEach(() => {
        fernFolders = [];
    });

    async function makeFernFolder(files: Record<string, string>): Promise<AbsoluteFilePath> {
        const root = await mkdtemp(pathJoin(tmpdir(), "fern-ref-content-root-"));
        const fernFolder = pathJoin(root, "fern");
        fernFolders.push(fernFolder);
        for (const [relativePath, contents] of Object.entries(files)) {
            const absolutePath = pathJoin(fernFolder, relativePath);
            await mkdir(pathJoin(absolutePath, ".."), { recursive: true });
            await writeFile(absolutePath, contents);
        }
        return AbsoluteFilePath.of(fernFolder);
    }

    function materialized(fernFolder: AbsoluteFilePath): MaterializedGitRef {
        return {
            ref: "v2.2.0",
            sha: "abc123",
            absolutePathToRepoRoot: AbsoluteFilePath.of(pathJoin(fernFolder, "..")),
            absolutePathToFernFolder: fernFolder
        };
    }

    it("uses the ref's docs.yml versions[0].path", async () => {
        const fernFolder = await makeFernFolder({
            "docs.yml": [
                "instances: []",
                "versions:",
                "  - display-name: Latest",
                "    path: ./versions/latest.yml",
                "  - display-name: Older",
                "    path: ./versions/older.yml"
            ].join("\n"),
            "versions/latest.yml": ["navigation:", "  - page: Latest", "    path: ./latest.mdx"].join("\n"),
            "versions/older.yml": ["navigation:", "  - page: Older", "    path: ./older.mdx"].join("\n")
        });

        const result = await resolveRefContentRoot({
            materialized: materialized(fernFolder),
            context
        });

        expect(result.absoluteFilepathToConfig).toBe(join(fernFolder, RelativeFilePath.of("versions/latest.yml")));
        expect(result.navigation).toEqual([{ page: "Latest", path: "./latest.mdx" }]);
    });

    it("falls back to the ref's top-level navigation when there are no versions", async () => {
        const fernFolder = await makeFernFolder({
            "docs.yml": ["instances: []", "navigation:", "  - page: Home", "    path: ./home.mdx"].join("\n")
        });

        const result = await resolveRefContentRoot({
            materialized: materialized(fernFolder),
            context
        });

        expect(result.absoluteFilepathToConfig).toBe(join(fernFolder, RelativeFilePath.of("docs.yml")));
        expect(result.navigation).toEqual([{ page: "Home", path: "./home.mdx" }]);
    });

    it("throws an actionable error when no content root can be determined", async () => {
        const fernFolder = await makeFernFolder({
            "docs.yml": ["instances: []", "title: Docs"].join("\n")
        });

        await expect(resolveRefContentRoot({ materialized: materialized(fernFolder), context })).rejects.toThrow(
            /Could not determine the content root for git ref 'v2.2.0'/
        );
    });
});
