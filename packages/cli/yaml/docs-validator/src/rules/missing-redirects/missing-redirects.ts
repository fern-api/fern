import { getToken } from "@fern-api/auth";
import { noop } from "@fern-api/core-utils";
import { DocsDefinitionResolver } from "@fern-api/docs-resolver";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { createLogger } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";

import { Rule, RuleViolation } from "../../Rule.js";
import { matchPath } from "../valid-markdown-link/redirect-for-path.js";
import { getInstanceUrls, removeTrailingSlash, toBaseUrl } from "../valid-markdown-link/url-utils.js";

const NOOP_CONTEXT = createMockTaskContext({ logger: createLogger(noop) });

interface MarkdownEntry {
    pageId: string;
    slug: string;
}

interface RemovedSlug {
    pageId: string;
    oldSlug: string;
    newSlug: string | undefined;
}

type FetchResult =
    | { type: "success"; entries: MarkdownEntry[] }
    | { type: "no-token" }
    | { type: "no-instance-url" }
    | { type: "fetch-failed"; reason: string }
    | { type: "first-publish" };

/**
 * Fetches the currently published markdown entries from FDR's slug table.
 *
 * Uses `POST /slugs/markdowns` which returns one entry per tracked markdown
 * page, keyed by pageId. The table is populated during `finishDocsRegister`
 * and always reflects the most recently published state.
 */
async function fetchMarkdownEntries(
    fdrOrigin: string,
    domain: string,
    basepath: string | undefined,
    authToken: string
): Promise<{ entries: MarkdownEntry[] } | { error: string }> {
    try {
        const response = await fetch(`${fdrOrigin}/slugs/markdowns`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`
            },
            body: JSON.stringify({ domain, basepath: basepath ?? "" })
        });
        if (!response.ok) {
            return { error: `FDR returned ${response.status}` };
        }
        const data = (await response.json()) as {
            entries?: Array<{ pageId: string; slug: string }>;
        };
        return {
            entries: (data.entries ?? []).map((entry) => ({
                pageId: entry.pageId,
                slug: entry.slug
            }))
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { error: message };
    }
}

function getFdrOrigin(): string {
    return (
        process.env.FERN_FDR_ORIGIN ??
        process.env.OVERRIDE_FDR_ORIGIN ??
        process.env.DEFAULT_FDR_ORIGIN ??
        "https://registry.buildwithfern.com"
    );
}

function withBasepath(source: string, basePath: string | undefined): string {
    if (basePath == null) {
        return source;
    }

    return source.startsWith(basePath)
        ? source
        : `${removeTrailingSlash(basePath)}${source.startsWith("/") ? "" : "/"}${source}`;
}

function isSlugCoveredByRedirect(
    oldSlug: string,
    redirects: { source: string; destination: string }[],
    basePath: string | undefined
): boolean {
    const oldPath = oldSlug.startsWith("/") ? oldSlug : `/${oldSlug}`;
    return redirects.some((redirect) => {
        const source = removeTrailingSlash(withBasepath(redirect.source, basePath));
        return matchPath(source, oldPath) !== false;
    });
}

export const MissingRedirectsRule: Rule = {
    name: "missing-redirects",
    create: async ({ workspace, apiWorkspaces, ossWorkspaces, logger }) => {
        const instanceUrls = getInstanceUrls(workspace);
        const url = instanceUrls[0];
        if (url == null) {
            return makeSkipVisitor({ type: "no-instance-url" });
        }

        const baseUrl = toBaseUrl(url);

        const token = await getToken();
        if (token == null) {
            return makeSkipVisitor({ type: "no-token" });
        }

        const result = await fetchMarkdownEntries(getFdrOrigin(), baseUrl.domain, baseUrl.basePath, token.value);
        if ("error" in result) {
            logger.debug(`[missing-redirects] FDR fetch failed: ${result.error}`);
            return makeSkipVisitor({ type: "fetch-failed", reason: result.error });
        }
        if (result.entries.length === 0) {
            logger.debug("[missing-redirects] No markdown entries found (first publish or empty slug table)");
            return makeSkipVisitor({ type: "first-publish" });
        }

        const docsDefinitionResolver = new DocsDefinitionResolver({
            domain: url,
            docsWorkspace: workspace,
            ossWorkspaces,
            apiWorkspaces,
            taskContext: NOOP_CONTEXT,
            editThisPage: undefined,
            uploadFiles: undefined,
            registerApi: undefined,
            targetAudiences: undefined
        });

        const resolvedDocsDefinition = await docsDefinitionResolver.resolve();
        if (!resolvedDocsDefinition.config.root) {
            return {};
        }

        const root = FernNavigation.migrate.FernNavigationV1ToLatest.create().root(resolvedDocsDefinition.config.root);
        const collector = FernNavigation.NodeCollector.collect(root);

        const localPageIdToSlug = new Map<string, string>();
        collector.slugMap.forEach((node, slug) => {
            if (node == null || !FernNavigation.isPage(node)) {
                return;
            }

            const pageId = FernNavigation.getPageId(node);
            if (pageId != null) {
                localPageIdToSlug.set(pageId, slug);
            }
        });

        const removedSlugs: RemovedSlug[] = [];
        for (const entry of result.entries) {
            const newSlug = localPageIdToSlug.get(entry.pageId);
            if (newSlug === undefined) {
                removedSlugs.push({ pageId: entry.pageId, oldSlug: entry.slug, newSlug: undefined });
            } else if (newSlug !== entry.slug) {
                removedSlugs.push({ pageId: entry.pageId, oldSlug: entry.slug, newSlug });
            }
        }

        if (removedSlugs.length === 0) {
            return {};
        }

        return {
            file: async ({ config }) => {
                const violations: RuleViolation[] = [];
                const redirects = (config.redirects ?? []).map((redirect) => ({
                    source: redirect.source,
                    destination: redirect.destination
                }));

                for (const removed of removedSlugs) {
                    if (isSlugCoveredByRedirect(removed.oldSlug, redirects, baseUrl.basePath)) {
                        continue;
                    }

                    const oldPath = removed.oldSlug.startsWith("/") ? removed.oldSlug : `/${removed.oldSlug}`;

                    if (removed.newSlug != null) {
                        const newPath = removed.newSlug.startsWith("/") ? removed.newSlug : `/${removed.newSlug}`;
                        violations.push({
                            severity: "warning",
                            message:
                                `Page "${removed.pageId}" was moved from "${oldPath}" to "${newPath}". ` +
                                `The old URL will return 404 without a redirect. ` +
                                `Add to docs.yml: redirects: [{source: "${oldPath}", destination: "${newPath}"}]`
                        });
                    } else {
                        violations.push({
                            severity: "warning",
                            message:
                                `Page "${removed.pageId}" was removed. ` +
                                `The previously published URL "${oldPath}" will return 404 without a redirect. ` +
                                `Consider adding a redirect in docs.yml to preserve existing links.`
                        });
                    }
                }

                return violations;
            }
        };
    }
};

/**
 * Returns a visitor that emits a single warning explaining why the check
 * was skipped. The severity override system promotes this to "error" when
 * the user has configured `missing-redirects: error`, which makes the CLI
 * exit with code 1 — matching the expectation that error-mode checks must
 * either pass or fail, never silently skip.
 *
 * In the default "warn" mode the message simply surfaces as a warning.
 */
function makeSkipVisitor(fetchResult: Exclude<FetchResult, { type: "success" }>): ReturnType<Rule["create"]> {
    switch (fetchResult.type) {
        case "no-instance-url":
        case "first-publish":
            return {};
        case "no-token":
            return {
                file: () => [
                    {
                        severity: "warning",
                        message:
                            "Missing redirects check skipped: not authenticated. " +
                            "Run 'fern login' or set the FERN_TOKEN environment variable to enable this check."
                    }
                ]
            };
        case "fetch-failed":
            return {
                file: () => [
                    {
                        severity: "warning",
                        message:
                            `Missing redirects check skipped: could not reach FDR (${fetchResult.reason}). ` +
                            "The check requires network access to compare against previously published docs."
                    }
                ]
            };
    }
}
