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

    it("uses the ref's first working-tree version, skipping ref-backed entries", async () => {
        const fernFolder = await makeFernFolder({
            "docs.yml": [
                "instances: []",
                "versions:",
                "  - display-name: '2.1.0'",
                "    ref: v2.1.0",
                "  - display-name: nightly",
                "    path: ./versions/current.yml"
            ].join("\n"),
            "versions/current.yml": ["navigation:", "  - page: Current", "    path: ./current.mdx"].join("\n")
        });

        const result = await resolveRefContentRoot({
            materialized: materialized(fernFolder),
            scope: { type: "site" },
            context
        });

        expect(result.absoluteFilepathToConfig).toBe(join(fernFolder, RelativeFilePath.of("versions/current.yml")));
    });

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
            scope: { type: "site" },
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
            scope: { type: "site" },
            context
        });

        expect(result.absoluteFilepathToConfig).toBe(join(fernFolder, RelativeFilePath.of("docs.yml")));
        expect(result.navigation).toEqual([{ page: "Home", path: "./home.mdx" }]);
    });

    it("throws an actionable error when no content root can be determined", async () => {
        const fernFolder = await makeFernFolder({
            "docs.yml": ["instances: []", "title: Docs"].join("\n")
        });

        await expect(
            resolveRefContentRoot({ materialized: materialized(fernFolder), scope: { type: "site" }, context })
        ).rejects.toThrow(/Could not determine the content root for git ref 'v2.2.0'/);
    });

    describe("products", () => {
        const productsDocsYml = [
            "instances: []",
            "products:",
            "  - display-name: Bare Metal",
            "    slug: bare-metal",
            "    path: ./products/bare-metal.yml",
            "  - display-name: Containers",
            "    slug: containers",
            "    path: ./products/containers.yml",
            "    versions:",
            "      - display-name: '1.1.0'",
            "        ref: containers-v1.1.0",
            "      - display-name: nightly",
            "        path: ./versions/containers/current.yml",
            "  - display-name: Forum",
            "    href: https://forums.example.com"
        ].join("\n");

        async function makeProductsFolder(): Promise<AbsoluteFilePath> {
            return makeFernFolder({
                "docs.yml": productsDocsYml,
                "products/bare-metal.yml": ["navigation:", "  - page: Bare Metal", "    path: ./bm.mdx"].join("\n"),
                "products/containers.yml": ["navigation: []"].join("\n"),
                "versions/containers/current.yml": ["navigation:", "  - page: Install", "    path: ./install.mdx"].join(
                    "\n"
                )
            });
        }

        it("follows the matching product's working-tree version at the ref", async () => {
            const fernFolder = await makeProductsFolder();

            const result = await resolveRefContentRoot({
                materialized: materialized(fernFolder),
                scope: { type: "product", displayName: "Containers (renamed on main)", slug: "containers" },
                context
            });

            expect(result.absoluteFilepathToConfig).toBe(
                join(fernFolder, RelativeFilePath.of("versions/containers/current.yml"))
            );
            expect(result.navigation).toEqual([{ page: "Install", path: "./install.mdx" }]);
        });

        it("prefers a slug match over an earlier product with the same display name", async () => {
            const fernFolder = await makeFernFolder({
                "docs.yml": [
                    "instances: []",
                    "products:",
                    "  - display-name: Containers",
                    "    path: ./products/legacy.yml",
                    "  - display-name: Containers",
                    "    slug: containers",
                    "    path: ./products/containers.yml"
                ].join("\n"),
                "products/legacy.yml": "navigation: []",
                "products/containers.yml": ["navigation:", "  - page: Install", "    path: ./install.mdx"].join("\n")
            });

            const result = await resolveRefContentRoot({
                materialized: materialized(fernFolder),
                scope: { type: "product", displayName: "Containers", slug: "containers" },
                context
            });

            expect(result.absoluteFilepathToConfig).toBe(
                join(fernFolder, RelativeFilePath.of("products/containers.yml"))
            );
        });

        it("falls back to the product file's navigation when the product has no versions at the ref", async () => {
            const fernFolder = await makeProductsFolder();

            const result = await resolveRefContentRoot({
                materialized: materialized(fernFolder),
                scope: { type: "product", displayName: "Bare Metal", slug: undefined },
                context
            });

            expect(result.absoluteFilepathToConfig).toBe(
                join(fernFolder, RelativeFilePath.of("products/bare-metal.yml"))
            );
            expect(result.navigation).toEqual([{ page: "Bare Metal", path: "./bm.mdx" }]);
        });

        it("names the products at the ref when the product cannot be found", async () => {
            const fernFolder = await makeProductsFolder();

            await expect(
                resolveRefContentRoot({
                    materialized: materialized(fernFolder),
                    scope: { type: "product", displayName: "Kata", slug: "kata" },
                    context
                })
            ).rejects.toThrow(
                /Could not find product 'Kata'.*Products at the ref: 'Bare Metal', 'Containers', 'Forum'/
            );
        });

        it("rejects a product that is an external link at the ref", async () => {
            const fernFolder = await makeProductsFolder();

            await expect(
                resolveRefContentRoot({
                    materialized: materialized(fernFolder),
                    scope: { type: "product", displayName: "Forum", slug: undefined },
                    context
                })
            ).rejects.toThrow(/Product 'Forum' is an external link/);
        });
    });
});
