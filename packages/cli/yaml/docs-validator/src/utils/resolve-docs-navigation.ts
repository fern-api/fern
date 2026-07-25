import { noop } from "@fern-api/core-utils";
import { DocsDefinitionResolver } from "@fern-api/docs-resolver";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createLogger } from "@fern-api/logger";
import { CliError, createMockTaskContext, TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace, DocsWorkspace } from "@fern-api/workspace-loader";

import { getInstanceUrls, removeLeadingSlash, toBaseUrl } from "../rules/valid-markdown-link/url-utils.js";

/**
 * Build a task context for `DocsDefinitionResolver` during validation.
 *
 * We can't use the real CLI context because the resolver is chatty (progress
 * logs, warnings, etc.) and we don't want that noise in `fern check` output.
 * A fully-noop context also swallows the message passed to `failAndThrow` —
 * leaving callers with a bare `TaskAbortSignal` and a silent exit code. This
 * context keeps logs quiet but surfaces `failAndThrow`/`failWithoutThrowing`
 * messages so that callers can report them as validation violations.
 */
function createDocsResolverValidationContext(): TaskContext {
    const base = createMockTaskContext({ logger: createLogger(noop) });
    const combineMessage = (message?: string, error?: unknown): string => {
        const parts: string[] = [];
        if (message != null) {
            parts.push(message);
        }
        if (error instanceof Error) {
            parts.push(error.message);
        } else if (error != null) {
            parts.push(JSON.stringify(error));
        }
        return parts.length > 0 ? parts.join(": ") : "Docs validation failed";
    };
    return {
        ...base,
        failAndThrow: (message?: string, error?: unknown) => {
            throw new Error(combineMessage(message, error));
        },
        failWithoutThrowing: (message?: string, error?: unknown) => {
            if (message != null || error != null) {
                base.logger.error(combineMessage(message, error));
            }
        }
    };
}

// The FDR SDK types config.root as {} via zod inference, but at runtime it is FernNavigation.V1.RootNode.
// This type guard checks the "type" discriminant to safely narrow the type without a blind cast.
function isV1RootNode(value: object): value is FernNavigation.V1.RootNode {
    return "type" in value && (value as { type: unknown }).type === "root";
}

// Special doc pages that the docs platform serves but that aren't part of the
// navigation tree, so links to them should still be considered valid.
const SPECIAL_DOC_PAGES = [
    "/llms-full.txt",
    "/llms.txt",
    "/openapi.json",
    "/openapi.yaml",
    "/openapi.yml",
    "/asyncapi.json",
    "/asyncapi.yaml",
    "/asyncapi.yml"
];

export interface ResolvedDocsNavigation {
    instanceUrls: string[];
    baseUrl: { domain: string; basePath?: string };
    /** All navigable slugs (including basePath and special doc pages). */
    visitableSlugs: Set<string>;
    absoluteFilePathsToSlugs: Map<AbsoluteFilePath, string[]>;
    versionSlugs: string[];
    productSlugs: string[];
}

/**
 * Resolve a docs workspace's navigation into the shared shape used by link
 * validation rules (`valid-markdown-links`, `valid-llms-txt`): the base URL,
 * the set of navigable slugs, the map of source files to their slugs, and the
 * version/product context slugs used to resolve context-relative links.
 */
export async function resolveDocsNavigation({
    workspace,
    apiWorkspaces,
    ossWorkspaces
}: {
    workspace: DocsWorkspace;
    apiWorkspaces: AbstractAPIWorkspace<unknown>[];
    ossWorkspaces: OSSWorkspace[];
}): Promise<ResolvedDocsNavigation> {
    const instanceUrls = getInstanceUrls(workspace);
    const url = instanceUrls[0] ?? "http://localhost";
    const baseUrl = toBaseUrl(url);

    const docsDefinitionResolver = new DocsDefinitionResolver({
        domain: url,
        docsWorkspace: workspace,
        ossWorkspaces,
        apiWorkspaces,
        taskContext: createDocsResolverValidationContext(),
        editThisPage: undefined,
        uploadFiles: undefined,
        registerApi: undefined,
        targetAudiences: undefined // not applicable for validation
    });

    const resolvedDocsDefinition = await docsDefinitionResolver.resolve();

    const configRoot = resolvedDocsDefinition.config.root;
    if (!configRoot || !isV1RootNode(configRoot)) {
        throw new CliError({ message: "Root node not found", code: CliError.Code.InternalError });
    }

    // TODO: this is a bit of a hack to get the navigation tree. We should probably just use the navigation tree
    // from the docs definition resolver, once there's a light way to retrieve it.
    const root = FernNavigation.migrate.FernNavigationV1ToLatest.create().root(configRoot);

    const collector = FernNavigation.NodeCollector.collect(root);

    const visitableSlugs = new Set<string>();
    const absoluteFilePathsToSlugs = new Map<AbsoluteFilePath, string[]>();
    collector.slugMap.forEach((node, slug) => {
        // NOTE: even if the node is not a page, it can still be "visitable" because it will redirect to another page.
        visitableSlugs.add(slug);

        if (node == null || !FernNavigation.isPage(node)) {
            return;
        }

        const pageId = FernNavigation.getPageId(node);
        if (pageId == null) {
            return;
        }

        const absoluteFilePath = join(workspace.absoluteFilePath, RelativeFilePath.of(pageId));
        const slugs = absoluteFilePathsToSlugs.get(absoluteFilePath) ?? [];
        slugs.push(slug);
        absoluteFilePathsToSlugs.set(absoluteFilePath, slugs);
    });

    // Collect version and product slugs for context-aware absolute link resolution
    const versionSlugs = collector.getVersionNodes().map((v) => v.slug);
    const productSlugs = collector
        .getProductNodes()
        .filter(FernNavigation.isInternalProductNode)
        .map((p) => p.slug);

    for (const specialPage of SPECIAL_DOC_PAGES) {
        const pageWithBasePath = baseUrl.basePath
            ? `${removeLeadingSlash(baseUrl.basePath)}${specialPage}`
            : removeLeadingSlash(specialPage);
        visitableSlugs.add(pageWithBasePath);
    }

    return {
        instanceUrls,
        baseUrl,
        visitableSlugs,
        absoluteFilePathsToSlugs,
        versionSlugs,
        productSlugs
    };
}
