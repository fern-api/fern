import { resolveFilepath } from "@fern-api/configuration-loader";

import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { Rule, RuleViolation } from "../../Rule.js";
import { checkIfPathnameExists } from "../valid-markdown-link/check-if-pathname-exists.js";
import { resolveDocsNavigation } from "../valid-markdown-link/resolve-docs-navigation.js";
import { validateLlmsTxtContent } from "./validate-llms-txt-content.js";

const RULE_NAME = "valid-llms-txt";

/**
 * Validates a custom root `llms.txt` (configured via `agents.llms-txt`) against
 * the resolved navigation, warning when a link points to a page that no longer
 * exists (drift / 404s).
 *
 * Warnings (not errors) so intentionally curated `llms.txt` files don't break
 * `fern check`, while still surfacing the silent drift that hand-maintained
 * files accumulate as pages move.
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

        // Resolve the path the same way the configuration loader does for this
        // field, so the rule inspects exactly the file the loader uploads.
        const llmsTxtAbsolutePath = resolveFilepath(rawLlmsTxtPath, workspace.absoluteFilepathToDocsConfig);

        // A missing file is reported by the filepaths-exist rule. Bail before
        // resolving the whole navigation so we don't pay that cost just to
        // return no violations.
        if (!existsSync(llmsTxtAbsolutePath)) {
            return {};
        }

        const { instanceUrls, baseUrl, visitableSlugs, absoluteFilePathsToSlugs, versionSlugs, productSlugs } =
            await resolveDocsNavigation({ workspace, apiWorkspaces, ossWorkspaces });

        return {
            file: async (): Promise<RuleViolation[]> => {
                const content = await readFile(llmsTxtAbsolutePath, "utf-8");

                return validateLlmsTxtContent({
                    content,
                    fileLabel: rawLlmsTxtPath,
                    ruleName: RULE_NAME,
                    instanceUrls,
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
