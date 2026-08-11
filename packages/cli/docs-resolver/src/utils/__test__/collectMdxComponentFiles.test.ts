import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";

import { collectMdxComponentFiles } from "../collectMdxComponentFiles.js";

async function createDocsWorkspace(): Promise<{ dir: string; cleanup: () => Promise<void> }> {
    const { path: dir, cleanup } = await tmp.dir({ unsafeCleanup: true });
    const componentsDir = path.join(dir, "components");
    await mkdir(path.join(componentsDir, "__tests__"), { recursive: true });
    await Promise.all(
        [
            "components/Banner.tsx",
            "components/helpers.ts",
            "components/notes.mdx",
            "components/Banner.test.tsx",
            "components/helpers.spec.ts",
            "components/__tests__/Banner.tsx",
            "components/README.txt"
        ].map((relativePath) => writeFile(path.join(dir, relativePath), ""))
    );
    return { dir, cleanup };
}

describe("collectMdxComponentFiles", () => {
    it("excludes test files when expanding a directory", async () => {
        const { dir, cleanup } = await createDocsWorkspace();
        try {
            const files = await collectMdxComponentFiles({
                absolutePathToDocsWorkspace: AbsoluteFilePath.of(dir),
                mdxComponents: ["./components"]
            });
            expect(files.map((file) => path.relative(dir, file)).sort()).toEqual([
                "components/Banner.tsx",
                "components/helpers.ts",
                "components/notes.mdx"
            ]);
        } finally {
            await cleanup();
        }
    });

    it("accepts an absolute component path", async () => {
        const { dir, cleanup } = await createDocsWorkspace();
        try {
            const files = await collectMdxComponentFiles({
                absolutePathToDocsWorkspace: AbsoluteFilePath.of(dir),
                mdxComponents: [path.join(dir, "components", "Banner.tsx")]
            });
            expect(files.map((file) => path.relative(dir, file))).toEqual(["components/Banner.tsx"]);
        } finally {
            await cleanup();
        }
    });

    it("includes a directly referenced file", async () => {
        const { dir, cleanup } = await createDocsWorkspace();
        try {
            const files = await collectMdxComponentFiles({
                absolutePathToDocsWorkspace: AbsoluteFilePath.of(dir),
                mdxComponents: ["./components/Banner.tsx", "./components/README.txt"]
            });
            expect(files.map((file) => path.relative(dir, file))).toEqual(["components/Banner.tsx"]);
        } finally {
            await cleanup();
        }
    });
});
