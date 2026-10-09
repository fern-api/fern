import type { docsYml } from "@fern-api/configuration";
import { kebabCase } from "lodash-es";
import { isAbsolute, relative, resolve } from "path";

type DocsNavigationConfig = Pick<docsYml.RawSchemas.DocsConfiguration, "navigation" | "tabs">;
type NavigationItem = docsYml.RawSchemas.NavigationItem;

export interface TabSlugPrefixResult {
    /** URL slug of the tab (and tab variant) the library's pages are listed under, e.g. "api-reference". */
    slugPrefix: string | undefined;
    /** Set when the pages are listed under tabs with different slugs, so no single prefix applies. */
    conflictingPrefixes?: string[];
}

/**
 * Generated pages carry an absolute frontmatter slug, which the docs build resolves from the
 * docs root, skipping the tab the pages are listed under. This finds that tab by looking for
 * `page:` and `folder:` entries in docs.yml that point into the library's output directory,
 * and returns its URL slug so the generator can prefix the frontmatter slugs with it.
 */
export function findTabSlugPrefix({
    docsConfig,
    docsDirectoryPath,
    outputDir
}: {
    docsConfig: DocsNavigationConfig;
    /** Directory containing docs.yml; navigation paths are relative to it. */
    docsDirectoryPath: string;
    /** Absolute path of the library's output directory. */
    outputDir: string;
}): TabSlugPrefixResult {
    const { navigation, tabs } = docsConfig;
    if (navigation == null) {
        return { slugPrefix: undefined };
    }

    const prefixes = new Set<string>();
    for (const item of navigation) {
        if (!("tab" in item)) {
            continue;
        }
        const tab = tabs?.[item.tab];
        if (tab == null) {
            continue;
        }
        const tabSlug = tab.skipSlug ? undefined : (tab.slug ?? kebabCase(tab.displayName));
        if ("variants" in item) {
            for (const variant of item.variants) {
                if (listsOutputDir(variant.layout, docsDirectoryPath, outputDir)) {
                    const variantSlug = variant.skipSlug ? undefined : (variant.slug ?? kebabCase(variant.title));
                    prefixes.add(joinSlugs(tabSlug, variantSlug));
                }
            }
        } else if (listsOutputDir(item.layout ?? [], docsDirectoryPath, outputDir)) {
            prefixes.add(joinSlugs(tabSlug));
        }
    }

    if (prefixes.size > 1) {
        return { slugPrefix: undefined, conflictingPrefixes: [...prefixes] };
    }
    const [prefix] = prefixes;
    return { slugPrefix: prefix != null && prefix.length > 0 ? prefix : undefined };
}

function listsOutputDir(items: NavigationItem[], docsDirectoryPath: string, outputDir: string): boolean {
    return items.some((item) => {
        if ("section" in item) {
            return listsOutputDir(item.contents, docsDirectoryPath, outputDir);
        }
        if ("page" in item) {
            return isWithin(resolve(docsDirectoryPath, item.path), outputDir);
        }
        if ("folder" in item) {
            const folder = resolve(docsDirectoryPath, item.folder);
            return isWithin(folder, outputDir) || isWithin(outputDir, folder);
        }
        return false;
    });
}

function isWithin(path: string, dir: string): boolean {
    const rel = relative(dir, path);
    return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

function joinSlugs(...slugs: (string | undefined)[]): string {
    return slugs
        .map((slug) => slug?.replace(/^\/+|\/+$/g, ""))
        .filter((slug): slug is string => slug != null && slug.length > 0)
        .join("/");
}
