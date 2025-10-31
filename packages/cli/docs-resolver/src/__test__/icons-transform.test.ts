import { parseDocsConfiguration } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, resolve as pathResolve, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it } from "vitest";

import { collectIconsFromDocsConfig, type IconRef, setIconFileIds } from "../utils/getImageFilepathsToUpload";

const context = createMockTaskContext();
const FIXTURE_ROOT = pathResolve(AbsoluteFilePath.of(__dirname), "fixtures/icons-transform/fern");

// For now we cover navigation (tabs/variants/sections/pages/links/changelog) + navbar links/rightIcon.
const EXPECTED_SUPPORTED_ICON_COUNT = 17;

/* --------------------------- helpers --------------------------- */

function resolveRelToAbs(rel: string): AbsoluteFilePath | undefined {
    try {
        // Treat every referenced path as relative to the fern/ fixture root.
        // If it's not a relative path, the collector wouldn't have added it anyway.
        const relFp = RelativeFilePath.of(rel);
        return pathResolve(FIXTURE_ROOT, relFp);
    } catch {
        return undefined;
    }
}

function simulateUploadIds(filepaths: Set<AbsoluteFilePath>): Map<AbsoluteFilePath, string> {
    const m = new Map<AbsoluteFilePath, string>();
    let i = 0;
    for (const abs of filepaths) {
        m.set(abs, `file_${String(i).padStart(3, "0")}`);
        i += 1;
    }
    return m;
}

/* ---------------------------- tests ---------------------------- */

describe("icons-transform (fixture: icons-transform/fern)", () => {
    it("collects expected local icon paths and refs", async () => {
        const docsWorkspace = await loadDocsWorkspace({ fernDirectory: FIXTURE_ROOT, context });
        if (docsWorkspace == null) {
            throw new Error("Workspace is null");
        }

        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration: docsWorkspace.config,
            absolutePathToFernFolder: docsWorkspace.absoluteFilePath,
            absoluteFilepathToDocsConfig: docsWorkspace.absoluteFilepathToDocsConfig,
            context
        });

        const { filepaths, refs } = await collectIconsFromDocsConfig({
            parsedDocsConfig: parsed,
            docsWorkspace
        });

        expect(filepaths.size).toBe(EXPECTED_SUPPORTED_ICON_COUNT);
        expect(refs.length).toBeGreaterThanOrEqual(EXPECTED_SUPPORTED_ICON_COUNT);

        // absolute + dedup sanity
        const arr = Array.from(filepaths).map(String);
        const unique = new Set(arr);
        expect(unique.size).toBe(arr.length);
    });

    it("rewrites collected icon fields to uploaded file IDs", async () => {
        const docsWorkspace = await loadDocsWorkspace({ fernDirectory: FIXTURE_ROOT, context });
        if (docsWorkspace == null) {
            throw new Error("Workspace is null");
        }

        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration: docsWorkspace.config,
            absolutePathToFernFolder: docsWorkspace.absoluteFilePath,
            absoluteFilepathToDocsConfig: docsWorkspace.absoluteFilepathToDocsConfig,
            context
        });

        const { filepaths, refs } = await collectIconsFromDocsConfig({
            parsedDocsConfig: parsed,
            docsWorkspace
        });

        // Pretend we uploaded and got back IDs
        const uploaded = simulateUploadIds(filepaths);

        // Use the production util (exported from utils)
        setIconFileIds(
            refs as IconRef[],
            (rel) => resolveRelToAbs(rel),
            (abs) => uploaded.get(abs)
        );

        // Every ref that resolves to an uploaded abs path should now be a "file_###" string
        for (const ref of refs) {
            const abs = resolveRelToAbs(ref.raw);
            if (abs != null && uploaded.has(abs)) {
                const value = (ref.holder as Record<string, unknown>)[ref.key];
                expect(typeof value).toBe("string");
                expect(String(value)).toMatch(/^file_\d{3}$/);
            }
        }
    });
});
