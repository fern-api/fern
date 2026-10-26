import { errorMessageOrString } from "@fern-api/core-utils";

import { stripAnchorsAndSearchParams } from "./url-utils.js";

export type SiblingBasepathsResult = { type: "success"; basepaths: string[] } | { type: "skipped"; reason: string };

function trimSlashes(path: string): string {
    return path.replace(/^\/+|\/+$/g, "");
}

/**
 * Fetches the basepaths of every site live on `domain` from FDR (`POST /slugs/sites`).
 * Basepaths have no leading/trailing slash; the root site is `""`.
 */
export async function fetchSiblingBasepaths({
    fdrOrigin,
    domain,
    token
}: {
    fdrOrigin: string;
    domain: string;
    token: string | undefined;
}): Promise<SiblingBasepathsResult> {
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
            body: JSON.stringify({ domain }),
            signal: AbortSignal.timeout(30_000)
        });
        if (!response.ok) {
            return { type: "skipped", reason: `FDR returned ${response.status}` };
        }
        const data: unknown = await response.json();
        return { type: "success", basepaths: parseBasepaths(data) };
    } catch (error) {
        return { type: "skipped", reason: errorMessageOrString(error) };
    }
}

function parseBasepaths(data: unknown): string[] {
    if (typeof data !== "object" || data == null || !("sites" in data) || !Array.isArray(data.sites)) {
        return [];
    }
    const basepaths: string[] = [];
    for (const site of data.sites) {
        if (typeof site === "object" && site != null && "basepath" in site && typeof site.basepath === "string") {
            basepaths.push(trimSlashes(site.basepath));
        }
    }
    return basepaths;
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
