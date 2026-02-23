import chalk from "chalk";

import type { RuleViolation } from "../../Rule.js";

/**
 * Minimal interface for the subset of NodeCollector we need.
 * Keeps the violation builder free of @fern-api/fdr-sdk so it can be tested in isolation.
 */
export interface SlugCollectorLike {
    slugMap: ReadonlyMap<string, { title: string }>;
    getOrphanedPages(): ReadonlyArray<{ title: string; slug: string }>;
}

/**
 * Build violations from a collector that has already processed a navigation tree.
 * Each orphaned page (shadowed by another node with the same slug) produces a warning.
 */
export function buildSlugCollisionViolations(collector: SlugCollectorLike): RuleViolation[] {
    // Build a map of slug -> winning node title for context in error messages
    const slugToWinnerTitle = new Map<string, string>();
    collector.slugMap.forEach((node, slug) => {
        slugToWinnerTitle.set(slug, node.title);
    });

    // Get orphaned pages (nodes that were shadowed by another node with the same slug)
    const orphanedPages = collector.getOrphanedPages();

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

    return violations;
}
