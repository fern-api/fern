import { noop } from "@fern-api/core-utils";
import { DocsDefinitionResolver } from "@fern-api/docs-resolver";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { dirname, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createLogger } from "@fern-api/logger";
import { CliError, createMockTaskContext, TaskContext } from "@fern-api/task-context";

import { readFile } from "fs/promises";
import { Rule, RuleViolation } from "../../Rule.js";
import { getInstanceUrls, toBaseUrl } from "../valid-markdown-link/url-utils.js";
import { PublishedPage, validateLlmsTxtContent } from "./validate-llms-txt-content.js";

const RULE_NAME = "valid-llms-txt";

function createDocsResolverValidationContext(): TaskContext {
    const base = createMockTaskContext({ logger: createLogger(noop) });
    return {
        ...base,
        failAndThrow: (message?: string, error?: unknown) => {
            const parts: string[] = [];
            if (message != null) {
                parts.push(message);
            }
            if (error instanceof Error) {
                parts.push(error.message);
            } else if (error != null) {
                parts.push(JSON.stringify(error));
            }
            throw new Error(parts.length > 0 ? parts.join(": ") : "Docs validation failed");
        },
        failWithoutThrowing: () => undefined
    };
}

function isV1RootNode(value: object): value is FernNavigation.V1.RootNode {
    return "type" in value && (value as { type: unknown }).type === "root";
}

/**
 * Validates a custom root `llms.txt` (configured via `agents.llms-txt`) against
 * the resolved navigation:
 *   - warns when a link points to a page that no longer exists (drift / 404s), and
 *   - warns when published, non-hidden pages are missing from the file.
 *
 * These are emitted as warnings (not errors) so intentionally curated `llms.txt`
 * files don't break `fern check`, while still surfacing the silent drift that
 * hand-maintained files accumulate as pages move.
 */
export const ValidLlmsTxtRule: Rule = {
    name: RULE_NAME,
    create: async ({ workspace, apiWorkspaces, ossWorkspaces }) => {
        const rawLlmsTxtPath = workspace.config.agents?.llmsTxt;

        // Only runs when a custom llms.txt is configured; the generated default
        // is always in sync with the navigation and needs no validation.
        if (rawLlmsTxtPath == null) {
            return {};
        }

        const instanceUrls = getInstanceUrls(workspace);
        const url = instanceUrls[0] ?? "http://localhost";
        const baseUrl = toBaseUrl(url);

        const resolver = new DocsDefinitionResolver({
            domain: url,
            docsWorkspace: workspace,
            ossWorkspaces,
            apiWorkspaces,
            taskContext: createDocsResolverValidationContext(),
            editThisPage: undefined,
            uploadFiles: undefined,
            registerApi: undefined,
            targetAudiences: undefined
        });

        const resolvedDocsDefinition = await resolver.resolve();
        const configRoot = resolvedDocsDefinition.config.root;
        if (!configRoot || !isV1RootNode(configRoot)) {
            throw new CliError({ message: "Root node not found", code: CliError.Code.InternalError });
        }

        const root = FernNavigation.migrate.FernNavigationV1ToLatest.create().root(configRoot);
        const collector = FernNavigation.NodeCollector.collect(root);

        const visitableSlugs = new Set<string>();
        const pagesByPageId = new Map<string, PublishedPage>();
        collector.slugMap.forEach((node, slug) => {
            visitableSlugs.add(slug);

            if (node == null || !FernNavigation.isPage(node)) {
                return;
            }
            // Skip pages hidden from navigation — they're intentionally not
            // surfaced, so their absence from llms.txt isn't drift.
            if (node.hidden) {
                return;
            }
            const pageId = FernNavigation.getPageId(node);
            if (pageId == null) {
                return;
            }
            const existing = pagesByPageId.get(pageId);
            if (existing != null) {
                existing.slugs.push(slug);
            } else {
                pagesByPageId.set(pageId, { pageId, title: node.title, slugs: [slug] });
            }
        });

        const llmsTxtAbsolutePath = join(
            dirname(workspace.absoluteFilepathToDocsConfig),
            RelativeFilePath.of(rawLlmsTxtPath)
        );

        return {
            file: async (): Promise<RuleViolation[]> => {
                let content: string;
                try {
                    content = await readFile(llmsTxtAbsolutePath, "utf-8");
                } catch {
                    // A missing file is reported by the filepaths-exist rule.
                    return [];
                }

                return validateLlmsTxtContent({
                    content,
                    fileLabel: rawLlmsTxtPath,
                    ruleName: RULE_NAME,
                    publishedPages: [...pagesByPageId.values()],
                    visitableSlugs,
                    basePath: baseUrl.basePath,
                    instanceHosts: instanceUrls.map((instanceUrl) => toBaseUrl(instanceUrl).domain),
                    redirectSources: (workspace.config.redirects ?? []).map((redirect) => redirect.source)
                });
            }
        };
    }
};
