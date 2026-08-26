import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";

import { parseDocsConfiguration } from "../parseDocsConfiguration.js";

const FAKE_FERN_DIR = "/fern" as AbsoluteFilePath;
const FAKE_CONFIG_PATH = "/fern/docs.yml" as AbsoluteFilePath;

// the published FDR SDK layout type does not know about sidebarFooterBehavior yet,
// which is why parseDocsConfiguration casts its layout (see showNavAvailabilityBadges)
type ParsedLayout = docsYml.ParsedDocsConfiguration["layout"] & {
    sidebarFooterBehavior?: "shrink" | "scroll";
};

async function parseLayout(layout: unknown): Promise<ParsedLayout> {
    // mirrors loadDocsWorkspace: kebab-case docs.yml keys -> camelCase raw config
    const rawDocsConfiguration = docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow({
        instances: [],
        navigation: [],
        ...(layout != null ? { layout } : {})
    });
    const parsed = await parseDocsConfiguration({
        rawDocsConfiguration,
        absolutePathToFernFolder: FAKE_FERN_DIR,
        absoluteFilepathToDocsConfig: FAKE_CONFIG_PATH,
        context: createMockTaskContext()
    });
    return parsed.layout as ParsedLayout;
}

describe("parseDocsConfiguration — layout.sidebar-footer-behavior", () => {
    it("is undefined when the key is omitted, so the renderer keeps its default", async () => {
        expect((await parseLayout({ "page-width": "full" }))?.sidebarFooterBehavior).toBeUndefined();
    });

    it.each(["shrink", "scroll"] as const)("maps the kebab-case key to sidebarFooterBehavior (%s)", async (value) => {
        expect((await parseLayout({ "sidebar-footer-behavior": value }))?.sidebarFooterBehavior).toBe(value);
    });

    it("rejects a value that is not a known behavior", async () => {
        await expect(parseLayout({ "sidebar-footer-behavior": "sticky" })).rejects.toThrow();
    });
});
