import { FernNavigation } from "@fern-api/fdr-sdk";
import { dirname, join, RelativeFilePath } from "@fern-api/fs-utils";

import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { Rule, RuleViolation } from "../../Rule.js";
import { checkIfPathnameExists } from "../valid-markdown-link/check-if-pathname-exists.js";
import { resolveDocsNavigation } from "../valid-markdown-link/resolve-docs-navigation.js";
import { PublishedPage, validateLlmsTxtContent } from "./validate-llms-txt-content.js";

const RULE_NAME = "valid-llms-txt";

/**
 * Validates a custom root `llms.txt` (configured via `agents.llms-txt`) against
 * the resolved navigation:
 *   - warns when a link points to a page that no longer exists (drift / 404s), and
 *   - warns when published, non-hidden pages are missing from the file.
 *
 * These are emitted as warnings (not errors) so intentionally curated `llms.txt`
 * files don't break `fern check`, while still surfacing the silent drift that
 * hand-maintained files accumulate as pages move.
 *
 * Link parsing and existence checks are delegated to the shared helpers used by
 * `valid-markdown-links` (`collectPathnamesToCheck`, `checkIfPathnameExists`,
 * `resolveDocsNavigation`) rather than re-implemented here.
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

        const llmsTxtAbsolutePath = join(
            dirname(workspace.absoluteFilepathToDocsConfig),
            RelativeFilePath.of(rawLlmsTxtPath)
        );

        // A missing file is reported by the filepaths-exist rule. Bail before
        // resolving the whole navigation so we don't pay that cost just to
        // return no violations.
        if (!existsSync(llmsTxtAbsolutePath)) {
            return {};
        }

        const {
            instanceUrls,
            baseUrl,
            visitableSlugs,
            absoluteFilePathsToSlugs,
            collector,
            versionSlugs,
            productSlugs
        } = await resolveDocsNavigation({ workspace, apiWorkspaces, ossWorkspaces });

        const pagesByPageId = new Map<string, PublishedPage>();
        collector.slugMap.forEach((node, slug) => {
            // Skip pages hidden from navigation — they're intentionally not
            // surfaced, so their absence from llms.txt isn't drift.
            if (node == null || !FernNavigation.isPage(node) || node.hidden) {
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

        return {
            file: async (): Promise<RuleViolation[]> => {
                const content = await readFile(llmsTxtAbsolutePath, "utf-8");

                return validateLlmsTxtContent({
                    content,
                    fileLabel: rawLlmsTxtPath,
                    ruleName: RULE_NAME,
                    instanceUrls,
                    publishedPages: [...pagesByPageId.values()],
                    basePath: baseUrl.basePath,
                    pathnameExists: async (pathname) => {
                        const result = await checkIfPathnameExists({
                            pathname,
                            markdown: true,
                            workspaceAbsoluteFilePath: workspace.absoluteFilePath,
                            pageSlugs: visitableSlugs,
                            absoluteFilePathsToSlugs,
                            redirects: workspace.config.redirects,
                            baseUrl,
                            versionSlugs,
                            productSlugs
                        });
                        return result === true;
                    }
                });
            }
        };
    }
};
