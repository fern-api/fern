import { noop } from "@fern-api/core-utils";
import { DocsDefinitionResolver } from "@fern-api/docs-resolver";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { createLogger } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";
import chalk from "chalk";

import { Rule, RuleViolation } from "../../Rule.js";

const NOOP_CONTEXT = createMockTaskContext({ logger: createLogger(noop) });

export const NoSlugCollisionsRule: Rule = {
    name: "no-slug-collisions",
    create: async ({ workspace, apiWorkspaces, ossWorkspaces }) => {
        const instanceUrls: string[] = [];
        workspace.config.instances.forEach((instance) => {
            instanceUrls.push(instance.url);
            if (typeof instance.customDomain === "string") {
                instanceUrls.push(instance.customDomain);
            } else if (Array.isArray(instance.customDomain)) {
                instanceUrls.push(...instance.customDomain);
            }
        });

        const url = instanceUrls[0] ?? "http://localhost";

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

        // Build a map of slug -> winning node for context in error messages
        const slugToWinnerTitle = new Map<string, string>();
        collector.slugMap.forEach((node, slug) => {
            slugToWinnerTitle.set(slug, node.title);
        });

        // Get orphaned pages (nodes that were shadowed by another node with the same slug)
        const orphanedPages = collector.getOrphanedPages();

        // Pre-compute violations so they are reported once via the `file` visitor
        const violations: RuleViolation[] = [];
        for (const orphanedNode of orphanedPages) {
            const winnerTitle = slugToWinnerTitle.get(orphanedNode.slug);
            const winnerLabel = winnerTitle != null ? ` (kept: ${chalk.bold(winnerTitle)})` : "";
            violations.push({
                severity: "warning",
                message:
                    `${chalk.bold(orphanedNode.title)} is shadowed by another page with the same slug ` +
                    `${chalk.dim("/" + orphanedNode.slug)}${winnerLabel}. ` +
                    `Add a custom ${chalk.cyan("slug")} to one of the pages in docs.yml to make both accessible.`
            });
        }

        return {
            file: () => violations
        };
    }
};
