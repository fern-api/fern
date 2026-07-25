import { RuleViolation } from "../../Rule.js";
import { collectPathnamesToCheck } from "../valid-markdown-link/collect-pathnames.js";
import {
    removeLeadingSlash,
    removeTrailingSlash,
    stripAnchorsAndSearchParams
} from "../valid-markdown-link/url-utils.js";

export interface LlmsTxtValidationInput {
    /** Raw contents of the custom llms.txt file. */
    content: string;
    /** Human-readable label (relative path) used in violation messages. */
    fileLabel: string;
    /** Rule name attached to each violation. */
    ruleName: string;
    /** Instance/custom-domain URLs, used to tell off-site links from internal ones. */
    instanceUrls: string[];
    /**
     * Resolves whether a link target exists in the docs navigation. The rule wires
     * this to `checkIfPathnameExists` — the same resolver used by
     * `valid-markdown-links` — so redirects, basePath handling, and special doc
     * pages are honored without re-implementing that logic here.
     */
    pathnameExists: (pathname: string) => Promise<boolean>;
}

/**
 * Reduce a link target to a canonical comparison key: strip anchors/query, a
 * trailing `.md`/`.mdx` (Fern serves both `/page` and `/page.md`), and
 * leading/trailing slashes.
 */
function toSlug(pathname: string): string {
    const withoutExt = stripAnchorsAndSearchParams(pathname).replace(/\.mdx?$/, "");
    return removeLeadingSlash(removeTrailingSlash(withoutExt));
}

/**
 * Validate a custom `llms.txt` against the resolved navigation, warning for each
 * link that points to a page that no longer exists (drift / 404s). Coverage
 * (published pages missing from the file) is intentionally not checked — curated
 * llms.txt files link a subset of pages on purpose, so that would be noise.
 */
export async function validateLlmsTxtContent(input: LlmsTxtValidationInput): Promise<RuleViolation[]> {
    const { content, fileLabel, ruleName, instanceUrls, pathnameExists } = input;
    const violations: RuleViolation[] = [];

    // Reuse the shared markdown link collector so llms.txt links are parsed the
    // same way page links are: anchors, `mailto:`, and off-site links are
    // dropped, and malformed URLs surface as their own violations.
    const { pathnamesToCheck, violations: extractionViolations } = collectPathnamesToCheck(content, { instanceUrls });
    violations.push(...extractionViolations.map((violation) => ({ ...violation, name: ruleName })));

    // De-dupe repeated targets so each is checked and reported at most once,
    // keeping the first pathname seen for the violation message.
    const slugToPathname = new Map<string, string>();
    for (const { pathname } of pathnamesToCheck) {
        const slug = toSlug(pathname);
        if (!slugToPathname.has(slug)) {
            slugToPathname.set(slug, pathname);
        }
    }

    // Batch the existence checks (each can hit the filesystem) instead of
    // awaiting them serially, matching how `valid-markdown-links` resolves links.
    const checkedSlugs = await Promise.all(
        [...slugToPathname.entries()].map(async ([slug, pathname]) => ({
            pathname,
            exists: await pathnameExists(`/${slug}`)
        }))
    );

    for (const { pathname, exists } of checkedSlugs) {
        if (!exists) {
            violations.push({
                name: ruleName,
                severity: "warning",
                message: `${fileLabel}: link to "${pathname}" points to a page that does not exist in the docs navigation.`
            });
        }
    }

    return violations;
}
