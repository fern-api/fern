import type { DocsConfigurationWithResolvedRedirects } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import type { DocsWorkspace } from "@fern-api/workspace-loader";

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { RuleContext, RuleViolation } from "../../../Rule.js";
import { LibraryFoldersInNavigationRule } from "../library-folders-in-navigation.js";

const GENERATED = "docs/generated/lib";

let fernDir: AbsoluteFilePath;

function writeGenerated(categories: string[]): void {
    for (const category of categories) {
        const dir = join(fernDir, RelativeFilePath.of(`${GENERATED}/${category}`));
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, RelativeFilePath.of("index.mdx")), `# ${category}\n`);
    }
}

async function run(
    navigation: DocsConfigurationWithResolvedRedirects["navigation"],
    versionNavigation?: unknown
): Promise<RuleViolation[]> {
    const config: DocsConfigurationWithResolvedRedirects = {
        instances: [],
        navigation,
        libraries: {
            lib: { lang: "cpp", input: { path: "../src" }, output: { path: GENERATED } }
        }
    };
    const workspace: DocsWorkspace = {
        type: "docs",
        workspaceName: undefined,
        absoluteFilePath: fernDir,
        absoluteFilepathToDocsConfig: join(fernDir, RelativeFilePath.of("docs.yml")),
        config
    };
    const visitor = await LibraryFoldersInNavigationRule.create({ workspace } as RuleContext);
    const violations = [...((await visitor.file?.({ config })) ?? [])];
    if (versionNavigation !== undefined && visitor.versionFile != null) {
        violations.push(
            ...(await visitor.versionFile({
                path: "versions/v1.yml",
                content: { navigation: versionNavigation },
                version: { displayName: "v1", path: "versions/v1.yml" }
            }))
        );
    }
    return violations;
}

describe("library-folders-in-navigation", () => {
    beforeEach(() => {
        fernDir = AbsoluteFilePath.of(
            mkdtempSync(join(AbsoluteFilePath.of(tmpdir()), RelativeFilePath.of("lib-nav-")))
        );
        writeGenerated(["functions", "typedefs", "macros"]);
    });
    afterEach(() => {
        rmSync(fernDir, { recursive: true, force: true });
    });

    it("warns for generated folders missing from a partially wired navigation", async () => {
        const violations = await run([
            {
                section: "API",
                contents: [{ folder: `${GENERATED}/functions` }, { folder: `${GENERATED}/typedefs` }]
            }
        ]);
        expect(violations).toHaveLength(1);
        expect(violations[0]?.severity).toBe("warning");
        expect(violations[0]?.message).toContain("docs/generated/lib/macros");
        expect(violations[0]?.message).toContain("library 'lib'");
    });

    it("accepts a folder item pointing at the whole output directory", async () => {
        expect(await run([{ folder: GENERATED }])).toEqual([]);
    });

    it("accepts a library navigation item", async () => {
        expect(await run([{ library: "lib" }])).toEqual([]);
    });

    it("stays quiet when a navigation does not reference the library at all", async () => {
        expect(await run([{ page: "Home", path: "./home.mdx" }])).toEqual([]);
    });

    it("resolves version-file navigation relative to the version file", async () => {
        const violations = await run(undefined, [
            { folder: `../${GENERATED}/functions` },
            { folder: `../${GENERATED}/typedefs` }
        ]);
        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain("folder: ../docs/generated/lib/macros");
    });
});
