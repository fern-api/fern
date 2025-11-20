import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { readFile } from "fs/promises";
import matter from "gray-matter";

const context = createMockTaskContext();

describe("sidebar-title frontmatter override", () => {
    it("should parse sidebar-title from frontmatter", async () => {
        const fixtureDir = resolve(AbsoluteFilePath.of(__dirname), "fixtures/sidebar-title/fern");

        const pageWithSidebarTitle = await readFile(resolve(fixtureDir, "page-with-sidebar-title.mdx"), "utf-8");
        const frontmatter1 = matter(pageWithSidebarTitle);
        expect(frontmatter1.data["sidebar-title"]).toBe("Custom Sidebar Title");

        const pageWithoutOverride = await readFile(resolve(fixtureDir, "page-without-override.mdx"), "utf-8");
        const frontmatter2 = matter(pageWithoutOverride);
        expect(frontmatter2.data["sidebar-title"]).toBeUndefined();

        const sectionOverview = await readFile(resolve(fixtureDir, "section-overview.mdx"), "utf-8");
        const frontmatter3 = matter(sectionOverview);
        expect(frontmatter3.data["sidebar-title"]).toBe("Custom Section Title");
    });

    it("should load docs workspace with sidebar-title pages", async () => {
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: resolve(AbsoluteFilePath.of(__dirname), "fixtures/sidebar-title/fern"),
            context
        });

        expect(docsWorkspace).toBeDefined();
        expect(docsWorkspace?.config).toBeDefined();
    });
});
