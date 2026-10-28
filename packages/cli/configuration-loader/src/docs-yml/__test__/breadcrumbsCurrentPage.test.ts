import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";

import { parseDocsConfiguration } from "../parseDocsConfiguration.js";

const FAKE_FERN_DIR = "/fern" as AbsoluteFilePath;
const FAKE_CONFIG_PATH = "/fern/docs.yml" as AbsoluteFilePath;

// The published FDR SDK's DocsLayoutConfig does not carry this field yet
// (parseDocsConfiguration casts it through), so read it structurally here.
type LayoutWithBreadcrumbs = { breadcrumbs?: { currentPage: boolean } } | undefined;

async function parseLayout(rawDocsYml: unknown): Promise<LayoutWithBreadcrumbs> {
    const rawDocsConfiguration = docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow(rawDocsYml);
    const parsed = await parseDocsConfiguration({
        rawDocsConfiguration,
        absolutePathToFernFolder: FAKE_FERN_DIR,
        absoluteFilepathToDocsConfig: FAKE_CONFIG_PATH,
        context: createMockTaskContext()
    });
    return parsed.layout as LayoutWithBreadcrumbs;
}

describe("parseDocsConfiguration — layout.breadcrumbs.current-page", () => {
    it("is undefined when the layout key is omitted", async () => {
        const layout = await parseLayout({ instances: [], navigation: [] });
        expect(layout?.breadcrumbs).toBeUndefined();
    });

    it("is undefined when breadcrumbs is omitted from layout", async () => {
        const layout = await parseLayout({ instances: [], navigation: [], layout: {} });
        expect(layout?.breadcrumbs).toBeUndefined();
    });

    it("defaults current-page to false when breadcrumbs is an empty object", async () => {
        const layout = await parseLayout({ instances: [], navigation: [], layout: { breadcrumbs: {} } });
        expect(layout?.breadcrumbs).toEqual({ currentPage: false });
    });

    it("maps the kebab-case key to the camelCase currentPage field", async () => {
        const enabled = await parseLayout({
            instances: [],
            navigation: [],
            layout: { breadcrumbs: { "current-page": true } }
        });
        expect(enabled?.breadcrumbs).toEqual({ currentPage: true });

        const disabled = await parseLayout({
            instances: [],
            navigation: [],
            layout: { breadcrumbs: { "current-page": false } }
        });
        expect(disabled?.breadcrumbs).toEqual({ currentPage: false });
    });
});
