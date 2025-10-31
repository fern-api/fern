import { readFile } from "node:fs/promises";
import { docsYml, parseDocsConfiguration } from "@fern-api/configuration-loader";
import { DocsV1Write } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, resolve as pathResolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import yaml from "js-yaml";
import { describe, expect, it } from "vitest";

import type { IconRef } from "../utils/getImageFilepathsToUpload";
import { collectIconsFromDocsConfig, setIconFileIds } from "../utils/getImageFilepathsToUpload";

/** Minimal shapes to inject extra navbar links in tests */
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

const context = createMockTaskContext();
const FIXTURE_ROOT = pathResolve(AbsoluteFilePath.of(__dirname), "fixtures/icons-transform/fern");
const DOCS_YML = pathResolve(FIXTURE_ROOT, "docs.yml");

// For now we cover navigation (tabs/variants/sections/pages/links/changelog) + navbar links/rightIcon.
const EXPECTED_SUPPORTED_ICON_COUNT = 17;

/* --------------------------- helpers --------------------------- */

async function loadParsed() {
    const docsWorkspace = await loadDocsWorkspace({ fernDirectory: FIXTURE_ROOT, context });
    if (docsWorkspace == null) {
        throw new Error("Workspace is null");
    }

    const raw = yaml.load(await readFile(DOCS_YML, "utf-8")) as docsYml.RawSchemas.DocsConfiguration;

    const parsed = await parseDocsConfiguration({
        rawDocsConfiguration: raw,
        absolutePathToFernFolder: docsWorkspace.absoluteFilePath,
        absoluteFilepathToDocsConfig: DOCS_YML as AbsoluteFilePath,
        context
    });

    return { parsed, docsWorkspace };
}

function simulateUploadsToFileIds(filepaths: Set<AbsoluteFilePath>): Map<AbsoluteFilePath, DocsV1Write.FileId> {
    const m = new Map<AbsoluteFilePath, DocsV1Write.FileId>();
    let i = 0;
    for (const abs of filepaths) {
        const id = `file_${String(i).padStart(3, "0")}`;
        m.set(abs, DocsV1Write.FileId(id));
        i += 1;
    }
    return m;
}

function rewriteWithProductionUtil(refs: IconRef[], collected: Map<AbsoluteFilePath, DocsV1Write.FileId>) {
    setIconFileIds(
        refs,
        (rel) => docsYml.resolveFilepath(rel, DOCS_YML as AbsoluteFilePath),
        (abs) => collected.get(abs)
    );
}

/* ---------------------------- tests ---------------------------- */

describe("icons-transform (fixture: icons-transform/fern)", () => {
    it("collects the expected set of local icon paths and references", async () => {
        const { parsed, docsWorkspace } = await loadParsed();

        const { filepaths, refs } = await collectIconsFromDocsConfig({
            parsedDocsConfig: parsed,
            docsWorkspace
        });

        expect(filepaths.size).toBe(EXPECTED_SUPPORTED_ICON_COUNT);
        // More refs than filepaths is fine when icon + rightIcon appear simultaneously
        expect(refs.length).toBeGreaterThanOrEqual(EXPECTED_SUPPORTED_ICON_COUNT);

        // Ensure all collected paths are absolute and deduped
        const arr = Array.from(filepaths);
        const unique = new Set(arr.map(String));
        expect(unique.size).toBe(arr.length);
    });

    it("rewrites collected icon fields to branded FileIds", async () => {
        const { parsed, docsWorkspace } = await loadParsed();

        const { filepaths, refs } = await collectIconsFromDocsConfig({
            parsedDocsConfig: parsed,
            docsWorkspace
        });

        const collected = simulateUploadsToFileIds(filepaths);

        rewriteWithProductionUtil(refs, collected);

        for (const ref of refs) {
            const abs = docsYml.resolveFilepath(ref.raw, DOCS_YML as AbsoluteFilePath);
            if (abs != null) {
                const expected = collected.get(abs);
                if (expected != null) {
                    const value = (ref.holder as Record<string, unknown>)[ref.key];
                    expect(value).toBe(expected);
                }
            }
        }
    });

    it("does not collect or rewrite FontAwesome (class) icons", async () => {
        const { parsed, docsWorkspace } = await loadParsed();

        const faIcon = "fa-solid fa-code";
        const extra: MinimalNavbarLink = { type: "minimal", text: "FA", href: "/fa", icon: faIcon };

        const widened = [...(parsed.navbarLinks ?? []), extra] as unknown;
        parsed.navbarLinks = widened as typeof parsed.navbarLinks;

        const { filepaths, refs } = await collectIconsFromDocsConfig({
            parsedDocsConfig: parsed,
            docsWorkspace
        });

        // FA classes should not even show up as refs or filepaths
        const refRaws = new Set(refs.map((r) => r.raw));
        expect(refRaws.has(faIcon)).toBe(false);

        for (const abs of filepaths) {
            expect(String(abs).includes("fa-solid")).toBe(false);
        }
    });

    it("does not collect or rewrite external URL icons", async () => {
        const { parsed, docsWorkspace } = await loadParsed();

        const urlIcon = "https://example.com/some-icon.svg";
        const extra: MinimalNavbarLink = { type: "minimal", text: "URL", href: "/url", icon: urlIcon };

        const widened = [...(parsed.navbarLinks ?? []), extra] as unknown;
        parsed.navbarLinks = widened as typeof parsed.navbarLinks;

        const { filepaths, refs } = await collectIconsFromDocsConfig({
            parsedDocsConfig: parsed,
            docsWorkspace
        });

        // We shouldn't push refs for URLs (since we don't process them)
        const refRaws = new Set(refs.map((r) => r.raw));
        expect(refRaws.has(urlIcon)).toBe(false);

        // And obviously nothing to upload
        for (const abs of filepaths) {
            expect(String(abs).includes("example.com")).toBe(false);
        }
    });

    it("collects and rewrites rightIcon when icon is absent", async () => {
        const { parsed, docsWorkspace } = await loadParsed();

        const rightOnlyPath = "docs/assets/arrow-right.svg";
        const extra: MinimalNavbarLink = { type: "minimal", text: "RightOnly", href: "/r", rightIcon: rightOnlyPath };

        const widened = [...(parsed.navbarLinks ?? []), extra] as unknown;
        parsed.navbarLinks = widened as typeof parsed.navbarLinks;

        const { filepaths, refs } = await collectIconsFromDocsConfig({
            parsedDocsConfig: parsed,
            docsWorkspace
        });

        const containsRight = refs.some((r) => r.key === "rightIcon" && r.raw === rightOnlyPath);
        expect(containsRight).toBe(true);

        const collected = simulateUploadsToFileIds(filepaths);
        rewriteWithProductionUtil(refs, collected);

        // find the ref we care about and ensure it's rewritten
        const ref = refs.find((r) => r.key === "rightIcon" && r.raw === rightOnlyPath);
        if (ref != null) {
            const abs = docsYml.resolveFilepath(ref.raw, DOCS_YML as AbsoluteFilePath);
            if (abs != null) {
                const expected = collected.get(abs);
                if (expected != null) {
                    const value = (ref.holder as Record<string, unknown>)[ref.key];
                    expect(value).toBe(expected);
                }
            }
        }
    });

    it("recursively collects icons inside dropdown children", async () => {
        const { parsed, docsWorkspace } = await loadParsed();

        const childA = "docs/assets/page-welcome.svg"; // existing file in fixture
        const childB = "docs/assets/arrow-right.svg"; // existing file in fixture
        const drop: MinimalNavbarLink = {
            type: "dropdown",
            text: "Menu",
            links: [
                { text: "A", icon: childA },
                { text: "B", rightIcon: childB }
            ]
        };

        const widened = [...(parsed.navbarLinks ?? []), drop] as unknown;
        parsed.navbarLinks = widened as typeof parsed.navbarLinks;

        const { filepaths, refs } = await collectIconsFromDocsConfig({
            parsedDocsConfig: parsed,
            docsWorkspace
        });

        const raws = new Set(refs.map((r) => r.raw));
        expect(raws.has(childA)).toBe(true);
        expect(raws.has(childB)).toBe(true);

        const collected = simulateUploadsToFileIds(filepaths);
        rewriteWithProductionUtil(refs, collected);

        const aRef = refs.find((r) => r.raw === childA);
        const bRef = refs.find((r) => r.raw === childB);
        if (aRef != null) {
            const abs = docsYml.resolveFilepath(aRef.raw, DOCS_YML as AbsoluteFilePath);
            if (abs != null) {
                const expected = collected.get(abs);
                if (expected != null) {
                    const value = (aRef.holder as Record<string, unknown>)[aRef.key];
                    expect(value).toBe(expected);
                }
            }
        }
        if (bRef != null) {
            const abs = docsYml.resolveFilepath(bRef.raw, DOCS_YML as AbsoluteFilePath);
            if (abs != null) {
                const expected = collected.get(abs);
                if (expected != null) {
                    const value = (bRef.holder as Record<string, unknown>)[bRef.key];
                    expect(value).toBe(expected);
                }
            }
        }
    });

    it("ignores null/undefined/empty/invalid icon values (no collection, no rewrite)", async () => {
        const { parsed, docsWorkspace } = await loadParsed();

        const extras: MinimalNavbarLink[] = [
            { type: "minimal", text: "Null", href: "/n", icon: undefined },
            { type: "minimal", text: "Empty", href: "/e", icon: "" },
            // @ts-expect-error – invalid type on purpose for edge case
            { type: "minimal", text: "BadType", href: "/b", icon: 42 as unknown as string }
        ];

        const widened = [...(parsed.navbarLinks ?? []), ...extras] as unknown;
        parsed.navbarLinks = widened as typeof parsed.navbarLinks;

        const { filepaths, refs } = await collectIconsFromDocsConfig({
            parsedDocsConfig: parsed,
            docsWorkspace
        });

        const rawSet = new Set(refs.map((r) => r.raw));
        expect(rawSet.has("")).toBe(false);
        expect(rawSet.has("42")).toBe(false);

        // nothing new to upload due to these invalid entries
        expect(filepaths.size).toBeGreaterThan(0);
    });

    it("dedupes identical file paths referenced multiple times", async () => {
        const { parsed, docsWorkspace } = await loadParsed();

        const dup = "docs/assets/page-welcome.svg"; // used elsewhere in fixture too
        const extras: MinimalNavbarLink[] = [
            { type: "minimal", text: "Dup1", href: "/d1", icon: dup },
            { type: "minimal", text: "Dup2", href: "/d2", rightIcon: dup }
        ];
        const widened = [...(parsed.navbarLinks ?? []), ...extras] as unknown;
        parsed.navbarLinks = widened as typeof parsed.navbarLinks;

        const { filepaths } = await collectIconsFromDocsConfig({
            parsedDocsConfig: parsed,
            docsWorkspace
        });

        // Ensure path appears only once among absolute upload set
        const occurrences = Array.from(filepaths).filter((abs) =>
            String(abs).endsWith("/docs/assets/page-welcome.svg")
        ).length;
        expect(occurrences).toBe(1);
    });

    // When you add products + API reference collectors, unskip and bump EXPECTED_SUPPORTED_ICON_COUNT → 23.
    // biome-ignore lint/suspicious/noSkippedTests: (TODO) implement remaining collectors)
    it.skip("covers all 23 icon locations once products & API reference collectors are implemented", () => {
        // TODO: bump fixture and assertion when the remaining collectors land.
    });
});
