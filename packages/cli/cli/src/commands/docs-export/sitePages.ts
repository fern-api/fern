import { createFdrService } from "@fern-api/core";
import { extractErrorMessage, stripTrailingSlashes } from "@fern-api/core-utils";
import type { DocsV2Read } from "@fern-api/fdr-sdk";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { buildFullRootFromSegments } from "@fern-api/fdr-sdk/navigation/ledger-root-builder";
import type { CurrentVersionResponse, NavResponse, VersionMetadataResponse } from "@fern-api/fdr-sdk/orpc-client";

/** `acme.com/docs/` (with or without a scheme) as the registry keys sites: `{ domain: "acme.com", basepath: "/docs" }`. */
export function splitDocsUrl(docsUrl: string): { domain: string; basepath: string } {
    const url = new URL(/^https?:\/\//.test(docsUrl) ? docsUrl : `https://${docsUrl}`);
    return { domain: url.hostname, basepath: stripTrailingSlashes(url.pathname) };
}

/**
 * The navigation the PDF exporter renders from when no product or version is given: the default
 * (else first) product, then its default (else first) version.
 */
export function defaultExportSubtree(root: FernNavigation.RootNode): FernNavigation.NavigationNode {
    const pickVersion = (
        node: FernNavigation.VersionedNode | FernNavigation.UnversionedNode
    ): FernNavigation.NavigationNode => {
        if (node.type === "unversioned") {
            return node;
        }
        const version = node.children.find((child) => child.default) ?? node.children[0];
        if (version == null) {
            throw new Error("The site has no versions to export.");
        }
        return version;
    };
    if (root.child.type !== "productgroup") {
        return pickVersion(root.child);
    }
    const products = root.child.children.filter(FernNavigation.isInternalProductNode);
    const product = products.find((child) => child.default) ?? products[0];
    if (product == null) {
        throw new Error("The site has no products to export.");
    }
    return pickVersion(product.child);
}

/**
 * The slugs of the pages a PDF export of `subtree` renders, in order. Mirrors the exporter's page
 * list: no hidden pages or changelogs, no content page without a page id, each slug once.
 * Authenticated pages count, since the exporter renders them too.
 */
export function exportablePageSlugs(subtree: FernNavigation.NavigationNode): string[] {
    const slugs: string[] = [];
    const seen = new Set<string>();
    FernNavigation.traverseDF(subtree, (node) => {
        if (
            !FernNavigation.isPage(node) ||
            node.hidden ||
            node.type === "changelog" ||
            node.type === "changelogEntry"
        ) {
            return;
        }
        if (!FernNavigation.isApiLeaf(node) && FernNavigation.getPageId(node) == null) {
            return;
        }
        const slug = String(node.slug);
        if (!seen.has(slug)) {
            seen.add(slug);
            slugs.push(slug);
        }
    });
    return slugs;
}

const LEDGER_TIMEOUT_MS = 30_000;

/** GET a docs-ledger read route; `undefined` when the registry has no such record. */
async function getLedger<T>(fdrOrigin: string, token: string, route: string): Promise<T | undefined> {
    const response = await fetch(`${stripTrailingSlashes(fdrOrigin)}/docs-ledger${route}`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(LEDGER_TIMEOUT_MS)
    });
    if (response.status === 404) {
        return undefined;
    }
    if (!response.ok) {
        const body = await response.text();
        let message = body;
        try {
            const parsed: unknown = JSON.parse(body);
            if (
                typeof parsed === "object" &&
                parsed != null &&
                "message" in parsed &&
                typeof parsed.message === "string"
            ) {
                message = parsed.message;
            }
        } catch {
            // not JSON; keep the raw body
        }
        throw new Error(`HTTP ${response.status}${message !== "" ? `: ${message}` : ""}`);
    }
    return (await response.json()) as T;
}

async function loadLedgerRoot({
    fdrOrigin,
    token,
    domain,
    basepath
}: {
    fdrOrigin: string;
    token: string;
    domain: string;
    basepath: string;
}): Promise<FernNavigation.RootNode | undefined> {
    const query = new URLSearchParams({ domain, basepath });
    const current = await getLedger<CurrentVersionResponse>(fdrOrigin, token, `/current-version?${query}`);
    if (current == null) {
        return undefined;
    }
    const metadata = await getLedger<VersionMetadataResponse>(
        fdrOrigin,
        token,
        `/version-metadata/${encodeURIComponent(current.deploymentId)}`
    );
    if (metadata == null) {
        throw new Error(`deployment ${current.deploymentId} not found`);
    }
    const navBySegment = new Map(
        await Promise.all(
            metadata.segments.map(async (segment) => {
                const nav = await getLedger<NavResponse>(
                    fdrOrigin,
                    token,
                    `/nav/${encodeURIComponent(segment.segmentHash)}`
                );
                return [segment.segmentHash, nav?.routes ?? []] as const;
            })
        )
    );
    return buildFullRootFromSegments({
        basePath: current.basepath,
        rootSlug: metadata.configJson?.rootSlug,
        title: metadata.configJson?.title ?? "",
        segments: metadata.segments,
        navBySegment
    });
}

async function loadLegacyRoot({
    fdrOrigin,
    token,
    docsUrl
}: {
    fdrOrigin: string;
    token: string;
    docsUrl: string;
}): Promise<FernNavigation.RootNode | undefined> {
    const fdr = createFdrService({ environment: fdrOrigin, token });
    const response = await fdr.docs.v2.read.getDocsForUrl({ url: docsUrl, excludeApis: true });
    if (!response.ok) {
        throw new Error(JSON.stringify(response.error));
    }
    const docs = response.body as DocsV2Read.LoadDocsForUrlResponse;
    const { root, navigation } = docs.definition.config;
    if (root != null) {
        return FernNavigation.migrate.FernNavigationV1ToLatest.create().root(root);
    }
    return navigation != null ? FernNavigation.utils.toRootNode(docs) : undefined;
}

/**
 * The slugs of every page a PDF export of the live site renders, in order, read from the registry
 * with the user's Fern token: the site's current ledger deployment, or its legacy docs definition
 * when it was last published before the ledger.
 */
export async function fetchSitePageSlugs({
    fdrOrigin,
    token,
    docsUrl
}: {
    fdrOrigin: string;
    token: string;
    docsUrl: string;
}): Promise<string[]> {
    let root: FernNavigation.RootNode | undefined;
    try {
        root =
            (await loadLedgerRoot({ fdrOrigin, token, ...splitDocsUrl(docsUrl) })) ??
            (await loadLegacyRoot({ fdrOrigin, token, docsUrl }));
    } catch (error) {
        throw new Error(`Listing the pages of ${docsUrl} failed: ${extractErrorMessage(error)}`);
    }
    if (root == null) {
        throw new Error(`Listing the pages of ${docsUrl} failed: the site has no navigation. Publish it first.`);
    }
    return exportablePageSlugs(defaultExportSubtree(root));
}
