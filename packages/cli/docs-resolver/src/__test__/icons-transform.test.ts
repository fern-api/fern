import { parseDocsConfiguration } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, resolve as pathResolve, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it } from "vitest";

import { collectIconsFromDocsConfig, setIconFileIds } from "../utils/getImageFilepathsToUpload";

const context = createMockTaskContext();
const FIXTURE_ROOT = pathResolve(AbsoluteFilePath.of(__dirname), "fixtures/icons-transform/fern");
const EXPECTED_SUPPORTED_ICON_COUNT = 17;

/* --------------------------- helpers --------------------------- */

function resolveRelToAbs(rel: string): AbsoluteFilePath | undefined {
    try {
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

type MinimalNavbarLinkBase = {
    text?: string;
    href?: string;
    icon?: string;
    rightIcon?: string;
    rounded?: boolean;
};
type MinimalNavbarLink =
    | ({ type: "minimal" | "filled" | "outlined" | "primary" | "secondary" } & MinimalNavbarLinkBase)
    | ({ type: "dropdown"; links: MinimalNavbarLinkBase[] } & MinimalNavbarLinkBase)
    | { type: "github"; url: string };

function extendParsedWithLinks<T extends { navbarLinks?: MinimalNavbarLink[] }>(
    parsed: T,
    extras: MinimalNavbarLink[]
): T {
    return { ...parsed, navbarLinks: [...(parsed.navbarLinks ?? []), ...extras] };
}

/* ---------------------------- tests ---------------------------- */

describe("icons-transform (fixture: icons-transform/fern)", () => {
    async function loadParsed() {
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

        return { docsWorkspace, parsed };
    }

    it("collects expected local icon paths and refs", async () => {
        const { parsed, docsWorkspace } = await loadParsed();
        const { filepaths, refs } = await collectIconsFromDocsConfig({ parsedDocsConfig: parsed, docsWorkspace });

        expect(filepaths.size).toBe(EXPECTED_SUPPORTED_ICON_COUNT);
        expect(refs.length).toBeGreaterThanOrEqual(EXPECTED_SUPPORTED_ICON_COUNT);
        expect(new Set([...filepaths].map(String)).size).toBe(filepaths.size);
    });

    it("rewrites collected icon fields to uploaded file IDs", async () => {
        const { parsed, docsWorkspace } = await loadParsed();
        const { filepaths, refs } = await collectIconsFromDocsConfig({ parsedDocsConfig: parsed, docsWorkspace });
        const uploaded = simulateUploadIds(filepaths);

        setIconFileIds(refs, resolveRelToAbs, (abs) => uploaded.get(abs));

        for (const ref of refs) {
            const abs = resolveRelToAbs(ref.raw);
            if (abs && uploaded.has(abs)) {
                const value = (ref.holder as Record<string, unknown>)[ref.key];
                expect(value).toMatch(/^file_\d{3}$/);
            }
        }
    });

    it("does not collect or rewrite FontAwesome/class icons", async () => {
        const { parsed, docsWorkspace } = await loadParsed();
        const faIcon = "fa-solid fa-code";
        const parsedWith = extendParsedWithLinks(parsed, [{ type: "minimal", text: "FA", href: "/fa", icon: faIcon }]);

        const { filepaths, refs } = await collectIconsFromDocsConfig({
            parsedDocsConfig: parsedWith,
            docsWorkspace
        });

        const refRaws = new Set(refs.map((r) => r.raw));
        expect(refRaws.has(faIcon)).toBe(false);
        for (const abs of filepaths) {
            expect(String(abs).includes("fa-solid")).toBe(false);
        }
    });

    it("does not rewrite external URL icons (ref collected but not uploaded)", async () => {
        const { parsed, docsWorkspace } = await loadParsed();
        const urlIcon = "https://example.com/some-icon.svg";
        const parsedWith = extendParsedWithLinks(parsed, [
            { type: "minimal", text: "URL", href: "/url", icon: urlIcon }
        ]);

        const { filepaths, refs } = await collectIconsFromDocsConfig({ parsedDocsConfig: parsedWith, docsWorkspace });

        const refRaws = new Set(refs.map((r) => r.raw));
        expect(refRaws.has(urlIcon)).toBe(true);
        for (const abs of filepaths) {
            expect(String(abs).includes("example.com")).toBe(false);
        }

        const uploaded = simulateUploadIds(filepaths);
        setIconFileIds(refs, resolveRelToAbs, (abs) => uploaded.get(abs));

        const urlRef = refs.find((r) => r.raw === urlIcon);
        if (urlRef) {
            const value = (urlRef.holder as Record<string, unknown>)[urlRef.key];
            expect(value).toBe(urlIcon);
        }
    });

    it("collects and rewrites rightIcon when icon is absent", async () => {
        const { parsed, docsWorkspace } = await loadParsed();
        const rightOnlyPath = "docs/assets/arrow-right.svg";
        const parsedWith = extendParsedWithLinks(parsed, [
            { type: "minimal", text: "RightOnly", href: "/r", rightIcon: rightOnlyPath }
        ]);

        const { filepaths, refs } = await collectIconsFromDocsConfig({ parsedDocsConfig: parsedWith, docsWorkspace });

        const hasRight = refs.some((r) => r.key === "rightIcon" && r.raw === rightOnlyPath);
        expect(hasRight).toBe(true);

        const uploaded = simulateUploadIds(filepaths);
        setIconFileIds(refs, resolveRelToAbs, (abs) => uploaded.get(abs));

        const ref = refs.find((r) => r.key === "rightIcon" && r.raw === rightOnlyPath);
        if (ref) {
            const abs = resolveRelToAbs(ref.raw);
            const expected = abs ? uploaded.get(abs) : undefined;
            expect((ref.holder as Record<string, unknown>)[ref.key]).toBe(expected);
        }
    });

    it("recursively collects icons inside dropdown children", async () => {
        const { parsed, docsWorkspace } = await loadParsed();
        const childA = "docs/assets/page-welcome.svg";
        const childB = "docs/assets/arrow-right.svg";
        const parsedWith = extendParsedWithLinks(parsed, [
            {
                type: "dropdown",
                text: "Menu",
                links: [
                    { text: "A", icon: childA },
                    { text: "B", rightIcon: childB }
                ]
            }
        ]);

        const { filepaths, refs } = await collectIconsFromDocsConfig({ parsedDocsConfig: parsedWith, docsWorkspace });

        const raws = new Set(refs.map((r) => r.raw));
        expect(raws.has(childA)).toBe(true);
        expect(raws.has(childB)).toBe(true);
    });

    it("ignores null/undefined/empty/invalid icon values (no collection, no rewrite)", async () => {
        const { parsed, docsWorkspace } = await loadParsed();
        const extras: MinimalNavbarLink[] = [
            { type: "minimal", text: "Null", href: "/n", icon: undefined },
            { type: "minimal", text: "Empty", href: "/e", icon: "" },
            { type: "minimal", text: "BadType", href: "/b", icon: String(42) }
        ];

        const parsedWith = extendParsedWithLinks(parsed, extras);
        const { filepaths, refs } = await collectIconsFromDocsConfig({ parsedDocsConfig: parsedWith, docsWorkspace });

        const rawSet = new Set(refs.map((r) => r.raw));
        expect(rawSet.has("")).toBe(false);
        expect(rawSet.has("42")).toBe(false);
        expect(filepaths.size).toBeGreaterThan(0);
    });

    it("dedupes identical file paths referenced multiple times", async () => {
        const { parsed, docsWorkspace } = await loadParsed();
        const dup = "docs/assets/page-welcome.svg";
        const parsedWith = extendParsedWithLinks(parsed, [
            { type: "minimal", text: "Dup1", href: "/d1", icon: dup },
            { type: "minimal", text: "Dup2", href: "/d2", rightIcon: dup }
        ]);

        const { filepaths } = await collectIconsFromDocsConfig({ parsedDocsConfig: parsedWith, docsWorkspace });

        const occurrences = Array.from(filepaths).filter((abs) =>
            String(abs).endsWith("/docs/assets/page-welcome.svg")
        ).length;
        expect(occurrences).toBe(1);
    });

    // biome-ignore lint/suspicious/noSkippedTests: (TODO) implement products & API reference collectors
    it.skip("covers all 23 icon locations once products & API reference collectors are implemented", () => {
        void 0;
    });
});
