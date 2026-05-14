import { getToken } from "@fern-api/auth";
import { DocsDefinitionResolver } from "@fern-api/docs-resolver";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { createLogger, type LogLevel } from "@fern-api/logger";
import { createMockTaskContext, type TaskContext } from "@fern-api/task-context";

import { formatInitError } from "../../formatInitError.js";
import { Rule } from "../../Rule.js";
import { getInstanceUrls, toBaseUrl } from "../valid-markdown-link/url-utils.js";
import { buildPageIdToSlugMap } from "./buildPageIdToSlugMap.js";
import {
    checkMissingRedirects,
    findRemovedSlugs,
    keepLatestEntryPerPageId,
    type MarkdownEntry
} from "./missing-redirects-logic.js";

/**
 * Captures the last `error`-level message routed through the mock task context
 * so we can surface it in the warning when `DocsDefinitionResolver.resolve()`
 * aborts via `failAndThrow`. The mock's `failAndThrow` throws a
 * `TaskAbortSignal` (a non-Error class) and logs the actual reason — without
 * this capture the rule would only see `[object Object]`.
 */
function createResolverContext(): { context: TaskContext; getLastErrorMessage: () => string | undefined } {
    let lastErrorMessage: string | undefined;
    const context = createMockTaskContext({
        logger: createLogger((level: LogLevel, ...args: string[]) => {
            if (level === "error") {
                lastErrorMessage = args.join(" ");
            }
        })
    });
    return { context, getLastErrorMessage: () => lastErrorMessage };
}

// The FDR SDK types config.root as {} via zod inference, but at runtime it is FernNavigation.V1.RootNode.
// This type guard checks the "type" discriminant to safely narrow the type without a blind cast.
function isV1RootNode(value: object): value is FernNavigation.V1.RootNode {
    return "type" in value && (value as { type: unknown }).type === "root";
}

type FetchResult =
    | { type: "success"; entries: MarkdownEntry[] }
    | { type: "no-token" }
    | { type: "no-instance-url" }
    | { type: "fetch-failed"; reason: string }
    | { type: "resolve-failed"; reason: string }
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
            body: JSON.stringify({ domain, basepath: basepath ?? "" }),
            signal: AbortSignal.timeout(30_000)
        });
        if (!response.ok) {
            return { error: `FDR returned ${response.status}` };
        }
        const data = (await response.json()) as {
            entries: MarkdownEntry[];
        };
        return {
            entries: data.entries
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

        let removedSlugs: ReturnType<typeof findRemovedSlugs>;
        const { context: resolverContext, getLastErrorMessage } = createResolverContext();
        try {
            const docsDefinitionResolver = new DocsDefinitionResolver({
                domain: url,
                docsWorkspace: workspace,
                ossWorkspaces,
                apiWorkspaces,
                taskContext: resolverContext,
                editThisPage: undefined,
                uploadFiles: undefined,
                registerApi: undefined,
                targetAudiences: undefined
            });

            const resolvedDocsDefinition = await docsDefinitionResolver.resolve();
            const configRoot = resolvedDocsDefinition.config.root;
            if (!configRoot || !isV1RootNode(configRoot)) {
                return {};
            }

            const root = FernNavigation.migrate.FernNavigationV1ToLatest.create().root(configRoot);
            const localPageIdToSlug = buildPageIdToSlugMap(root);
            const latestEntries = keepLatestEntryPerPageId(result.entries);
            removedSlugs = findRemovedSlugs(latestEntries, localPageIdToSlug);
        } catch (error) {
            // `DocsDefinitionResolver` reports fatal errors via `taskContext.failAndThrow`,
            // which throws a `TaskAbortSignal` (a non-Error sentinel class) after logging
            // the real reason. Prefer the captured log message over `String(error)` so the
            // warning includes something actionable instead of `[object Object]`.
            const reason = getLastErrorMessage() ?? formatInitError(error);
            logger.debug(`[missing-redirects] Failed to resolve local docs navigation: ${reason}`);
            return makeSkipVisitor({ type: "resolve-failed", reason });
        }

        if (removedSlugs.length === 0) {
            return {};
        }

        return {
            file: async ({ config }) => {
                const redirects = (config.redirects ?? []).map((redirect) => ({
                    source: redirect.source,
                    destination: redirect.destination
                }));
                return checkMissingRedirects(removedSlugs, redirects, baseUrl.basePath);
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
        case "resolve-failed":
            return {
                file: () => [
                    {
                        severity: "warning",
                        message:
                            `Missing redirects check skipped: failed to resolve local docs navigation (${fetchResult.reason}). ` +
                            "Run `fern check --log-level=debug` for more detail."
                    }
                ]
            };
    }
}
