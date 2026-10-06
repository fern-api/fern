import { getToken } from "@fern-api/auth";
import { DocsDefinitionResolver } from "@fern-api/docs-resolver";
import { DocsV1Write, FernNavigation } from "@fern-api/fdr-sdk";
import { createLogger, type Logger, type LogLevel } from "@fern-api/logger";
import { createMockTaskContext, type TaskContext } from "@fern-api/task-context";
import { type DocsWorkspace } from "@fern-api/workspace-loader";

import { formatInitError } from "../../formatInitError.js";
import { Rule, type RuleContext, type RuleViolation } from "../../Rule.js";
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
        const violations = await findMissingRedirects({
            workspace,
            logger,
            token: (await getToken())?.value,
            resolveLocalDocs: (url) => resolveLocalDocs({ url, workspace, apiWorkspaces, ossWorkspaces })
        });
        return violations.length === 0 ? {} : { file: () => violations };
    }
};

/**
 * Compares the live site's published pages (from FDR) with the local docs and returns a
 * warning for each page whose URL disappears without a redirect. Also returns a single
 * warning when the comparison can't run (no token, FDR unreachable, local docs fail to resolve).
 *
 * `resolveLocalDocs` is only called once FDR has returned published pages, so callers that
 * already resolved the docs can pass them in without paying for a second resolve.
 */
export async function findMissingRedirects({
    workspace,
    logger,
    token,
    resolveLocalDocs
}: {
    workspace: DocsWorkspace;
    logger: Logger;
    /** Fern token used to read the live site's pages from FDR; the comparison is skipped without one. */
    token: string | undefined;
    resolveLocalDocs: (url: string) => Promise<DocsV1Write.DocsDefinition>;
}): Promise<RuleViolation[]> {
    const url = getInstanceUrls(workspace)[0];
    if (url == null) {
        return getSkipViolations({ type: "no-instance-url" });
    }

    const baseUrl = toBaseUrl(url);

    if (token == null) {
        return getSkipViolations({ type: "no-token" });
    }

    const result = await fetchMarkdownEntries(getFdrOrigin(), baseUrl.domain, baseUrl.basePath, token);
    if ("error" in result) {
        logger.debug(`[missing-redirects] FDR fetch failed: ${result.error}`);
        return getSkipViolations({ type: "fetch-failed", reason: result.error });
    }
    if (result.entries.length === 0) {
        logger.debug("[missing-redirects] No markdown entries found (first publish or empty slug table)");
        return getSkipViolations({ type: "first-publish" });
    }

    let removedSlugs: ReturnType<typeof findRemovedSlugs>;
    try {
        const configRoot = (await resolveLocalDocs(url)).config.root;
        if (!configRoot || !isV1RootNode(configRoot)) {
            return [];
        }

        const root = FernNavigation.migrate.FernNavigationV1ToLatest.create().root(configRoot);
        const localPageIdToSlug = buildPageIdToSlugMap(root);
        const latestEntries = keepLatestEntryPerPageId(result.entries);
        removedSlugs = findRemovedSlugs(latestEntries, localPageIdToSlug);
    } catch (error) {
        const reason = formatInitError(error);
        logger.debug(`[missing-redirects] Failed to resolve local docs navigation: ${reason}`);
        return getSkipViolations({ type: "resolve-failed", reason });
    }

    const redirects = (workspace.config.redirects ?? []).map((redirect) => ({
        source: redirect.source,
        destination: redirect.destination
    }));
    return checkMissingRedirects(removedSlugs, redirects, baseUrl.basePath);
}

async function resolveLocalDocs({
    url,
    workspace,
    apiWorkspaces,
    ossWorkspaces
}: { url: string } & Pick<
    RuleContext,
    "workspace" | "apiWorkspaces" | "ossWorkspaces"
>): Promise<DocsV1Write.DocsDefinition> {
    const { context, getLastErrorMessage } = createResolverContext();
    const docsDefinitionResolver = new DocsDefinitionResolver({
        domain: url,
        docsWorkspace: workspace,
        ossWorkspaces,
        apiWorkspaces,
        taskContext: context,
        editThisPage: undefined,
        uploadFiles: undefined,
        registerApi: undefined,
        targetAudiences: undefined,
        // current-tree validation only; git-ref-backed versions are built at publish/preview time
        buildRefVersions: false
    });
    try {
        return await docsDefinitionResolver.resolve();
    } catch (error) {
        // `DocsDefinitionResolver` reports fatal errors via `taskContext.failAndThrow`,
        // which throws a `TaskAbortSignal` (a non-Error sentinel class) after logging
        // the real reason. Prefer the captured log message over `String(error)` so the
        // warning includes something actionable instead of `[object Object]`.
        throw new Error(getLastErrorMessage() ?? formatInitError(error));
    }
}

/**
 * Returns a single warning explaining why the check was skipped. The severity
 * override system promotes this to "error" when the user has configured
 * `missing-redirects: error`, which makes the CLI exit with code 1 — matching
 * the expectation that error-mode checks must either pass or fail, never
 * silently skip.
 *
 * In the default "warn" mode the message simply surfaces as a warning.
 */
function getSkipViolations(fetchResult: Exclude<FetchResult, { type: "success" }>): RuleViolation[] {
    switch (fetchResult.type) {
        case "no-instance-url":
        case "first-publish":
            return [];
        case "no-token":
            return [
                {
                    severity: "warning",
                    message:
                        "Missing redirects check skipped: not authenticated. " +
                        "Run 'fern login' or set the FERN_TOKEN environment variable to enable this check."
                }
            ];
        case "fetch-failed":
            return [
                {
                    severity: "warning",
                    message:
                        `Missing redirects check skipped: could not reach FDR (${fetchResult.reason}). ` +
                        "The check requires network access to compare against previously published docs."
                }
            ];
        case "resolve-failed":
            return [
                {
                    severity: "warning",
                    message:
                        `Missing redirects check skipped: failed to resolve local docs navigation (${fetchResult.reason}). ` +
                        "Run `fern check --log-level=debug` for more detail."
                }
            ];
    }
}
