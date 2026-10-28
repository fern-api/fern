import { errorMessageOrString } from "@fern-api/core-utils";

import { stripAnchorsAndSearchParams } from "./url-utils.js";

const FETCH_TIMEOUT_MS = 30_000;

/** A site live on the domain. `slugs` is undefined when FDR has no page list for it. */
export interface SiblingSite {
    basepath: string;
    slugs: ReadonlySet<string> | undefined;
}

export type SiblingSitesResult = { type: "success"; sites: SiblingSite[] } | { type: "skipped"; reason: string };

function trimSlashes(path: string): string {
    return path.replace(/^\/+|\/+$/g, "");
}

/**
 * Fetches every site live on `domain` with its published page slugs from FDR (`POST /slugs/sites`).
 * Basepaths and slugs have no leading/trailing slash; the root site is `""`.
 */
export async function fetchSiblingSites({
    fdrOrigin,
    domain,
    token
}: {
    fdrOrigin: string;
    domain: string;
    token: string | undefined;
}): Promise<SiblingSitesResult> {
    if (token == null) {
        return { type: "skipped", reason: "not authenticated" };
    }
    try {
        const response = await fetch(`${fdrOrigin}/slugs/sites`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ domain, includeSlugs: true }),
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
        });
        if (!response.ok) {
            return { type: "skipped", reason: `FDR returned ${response.status}` };
        }
        const data: unknown = await response.json();
        return { type: "success", sites: parseSites(data) };
    } catch (error) {
        if (error instanceof Error && error.name === "TimeoutError") {
            return { type: "skipped", reason: `FDR timed out after ${FETCH_TIMEOUT_MS / 1000}s` };
        }
        return { type: "skipped", reason: errorMessageOrString(error) };
    }
}

function parseSites(data: unknown): SiblingSite[] {
    if (typeof data !== "object" || data == null || !("sites" in data) || !Array.isArray(data.sites)) {
        return [];
    }
    const sites: SiblingSite[] = [];
    for (const site of data.sites) {
        if (typeof site !== "object" || site == null || !("basepath" in site) || typeof site.basepath !== "string") {
            continue;
        }
        const slugs = "slugs" in site && Array.isArray(site.slugs) ? parseSlugs(site.slugs) : undefined;
        sites.push({ basepath: trimSlashes(site.basepath), slugs });
    }
    return sites;
}

function parseSlugs(values: unknown[]): Set<string> {
    const slugs = new Set<string>();
    for (const value of values) {
        if (typeof value === "string") {
            slugs.add(trimSlashes(value));
        }
    }
    return slugs;
}

export type SiblingLinkStatus = "found" | "missing" | "unverified";

/**
 * Whether a root-relative `pathname` under `site` is a page FDR has on record for that site's
 * current production deployment. The site's own basepath always resolves (it is the site's root).
 */
export function checkSiblingLink(pathname: string, site: SiblingSite): SiblingLinkStatus {
    if (site.slugs == null) {
        return "unverified";
    }
    const path = trimSlashes(stripAnchorsAndSearchParams(pathname));
    return path === site.basepath || site.slugs.has(path) ? "found" : "missing";
}

/**
 * Returns the sibling basepath (without slashes) that a root-relative `pathname` points under,
 * or `undefined` when it belongs to the current site or no sibling. The longest matching
 * basepath wins so nested sites resolve to the innermost one, and the current site always
 * competes so its own links keep being checked.
 */
export function getSiblingSiteBasepath(
    pathname: string,
    currentBasePath: string | undefined,
    siblingBasepaths: readonly string[]
): string | undefined {
    if (!pathname.startsWith("/") || siblingBasepaths.length === 0) {
        return undefined;
    }
    const current = trimSlashes(currentBasePath ?? "");
    const path = trimSlashes(stripAnchorsAndSearchParams(pathname));
    let match: string | undefined;
    for (const candidate of [current, ...siblingBasepaths.map(trimSlashes)]) {
        const matches = candidate === "" ? path === "" : path === candidate || path.startsWith(`${candidate}/`);
        if (matches && (match == null || candidate.length > match.length)) {
            match = candidate;
        }
    }
    return match != null && match !== current ? match : undefined;
}
