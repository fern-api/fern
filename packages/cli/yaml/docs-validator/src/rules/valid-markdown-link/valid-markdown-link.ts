import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { Rule, RuleViolation } from "../../Rule";
import { DocsDefinitionResolver, convertIrToApiDefinition } from "@fern-api/docs-resolver";
import { createMockTaskContext } from "@fern-api/task-context";
import { APIV1Read, FernNavigation, ApiDefinition } from "@fern-api/fdr-sdk";
import type { Position } from "unist";
import { toBaseUrl, getInstanceUrls } from "./url-utils";
import chalk from "chalk";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { randomUUID } from "crypto";
import { noop } from "@fern-api/core-utils";
import { createLogger } from "@fern-api/logger";
import { collectPathnamesToCheck, PathnameToCheck } from "./collect-pathnames";
import { checkIfPathnameExists } from "./check-if-pathname-exists";

const NOOP_CONTEXT = createMockTaskContext({ logger: createLogger(noop) });

export const ValidMarkdownLinks: Rule = {
    name: "valid-markdown-links",
    create: async ({ workspace, loadApiWorkspace }) => {
        const instanceUrls = getInstanceUrls(workspace);

        const url = instanceUrls[0] ?? "http://localhost";

        const docsDefinitionResolver = new DocsDefinitionResolver(url, workspace, loadApiWorkspace, NOOP_CONTEXT);

        const resolvedDocsDefinition = await docsDefinitionResolver.resolve();

        if (!resolvedDocsDefinition.config.root) {
            throw new Error("Root node not found");
        }

        // TODO: this is a bit of a hack to get the navigation tree. We should probably just use the navigation tree
        // from the docs definition resolver, once there's a light way to retrieve it.
        const root = FernNavigation.migrate.FernNavigationV1ToLatest.create().root(resolvedDocsDefinition.config.root);

        // all the page slugs in the docs:
        const collector = FernNavigation.NodeCollector.collect(root);

        const visitableSlugs = new Set<string>();
        const absoluteFilePathsToSlugs = new Map<AbsoluteFilePath, string[]>();
        const endpoints: FernNavigation.NavigationNodeApiLeaf[] = [];
        collector.slugMap.forEach((node, slug) => {
            // NOTE: even if the node is not a page, it can still be "visitable" because it will redirect to another page.
            visitableSlugs.add(slug);

            if (node == null || !FernNavigation.isPage(node)) {
                return;
            }

            if (FernNavigation.isApiLeaf(node)) {
                endpoints.push(node);
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

        return {
            markdownPage: async ({ content, absoluteFilepath }) => {
                const slugs = absoluteFilePathsToSlugs.get(absoluteFilepath);

                // if this happens, this probably means that the current file is omitted from the docs navigation
                // most likely due to a slug collision. This should be handled in a different rule.
                if (!slugs || slugs.length === 0) {
                    return [];
                }

                // if this file cannot be indexed (noindex=true, or hidden=true), then we don't need to check for links
                // since it will not hurt SEO.
                // TODO: we should at least report this somehow, since it's a bad UX.
                if (slugs.every((slug) => !collector.indexablePageSlugs.includes(slug))) {
                    return [];
                }

                // Find all matches in the Markdown text
                const { pathnamesToCheck, violations } = collectPathnamesToCheck(content, {
                    absoluteFilepath,
                    instanceUrls
                });

                const pathToCheckViolations = await Promise.all(
                    pathnamesToCheck.map(async (pathnameToCheck) => {
                        const exists = await checkIfPathnameExists(pathnameToCheck.pathname, {
                            markdown: pathnameToCheck.markdown,
                            absoluteFilepath,
                            workspaceAbsoluteFilePath: workspace.absoluteFilePath,
                            pageSlugs: visitableSlugs,
                            absoluteFilePathsToSlugs,
                            redirects: workspace.config.redirects,
                            baseUrl: toBaseUrl(instanceUrls[0] ?? "http://localhost")
                        });

                        if (exists === true) {
                            return [];
                        }

                        return exists.map((brokenPathname) => {
                            const message = createLinkViolationMessage(pathnameToCheck, brokenPathname);
                            return {
                                severity: "warning" as const,
                                message
                            };
                        });
                    })
                );

                return [...violations, ...pathToCheckViolations.flat()];
            },
            apiSection: async ({ workspace: apiWorkspace, config }) => {
                // TODO: this is duplicating work from above, but there's no clean way to associate this visitor with the docs resolver
                const fernWorkspace = await apiWorkspace.toFernWorkspace(
                    { context: NOOP_CONTEXT },
                    { enableUniqueErrorsPerEndpoint: true, detectGlobalHeaders: false }
                );
                const ir = await generateIntermediateRepresentation({
                    workspace: fernWorkspace,
                    audiences: config.audiences ? { type: "select", audiences: config.audiences } : { type: "all" },
                    generationLanguage: undefined,
                    keywords: undefined,
                    smartCasing: false,
                    disableExamples: false,
                    readme: undefined,
                    version: undefined,
                    packageName: undefined,
                    context: NOOP_CONTEXT
                });
                const api = toLatest(convertIrToApiDefinition(ir, randomUUID()));

                const violations: RuleViolation[] = [];

                for (const endpoint of endpoints) {
                    const descriptions = await collectDescriptions(ApiDefinition.prune(api, endpoint));

                    for (const description of descriptions) {
                        const { pathnamesToCheck, violations: descriptionViolations } = collectPathnamesToCheck(
                            description,
                            { instanceUrls }
                        );

                        violations.push(...descriptionViolations);

                        const pathToCheckViolations = await Promise.all(
                            pathnamesToCheck.map(async (pathnameToCheck) => {
                                // TODO: we don't know where the endpoint is defined (which file it's in) so this doesn't always work
                                const exists = await checkIfPathnameExists(pathnameToCheck.pathname, {
                                    markdown: pathnameToCheck.markdown,
                                    workspaceAbsoluteFilePath: workspace.absoluteFilePath,
                                    pageSlugs: visitableSlugs,
                                    absoluteFilePathsToSlugs,
                                    redirects: workspace.config.redirects,
                                    baseUrl: toBaseUrl(instanceUrls[0] ?? "http://localhost")
                                });

                                if (exists === true) {
                                    return [];
                                }

                                // TODO: we don't have the position of the description, so we can't create a useful message
                                // that points to the endpoint definition file and line number.
                                // We could potentially add this information in the future, but it's not a huge deal right now.
                                return exists.map((brokenPathname) => {
                                    const message = createLinkViolationMessage(pathnameToCheck, brokenPathname);
                                    return {
                                        severity: "warning" as const,
                                        message
                                    };
                                });
                            })
                        );

                        violations.push(...pathToCheckViolations.flat());
                    }
                }

                return violations;
            }
        };
    }
};

function createLinkViolationMessage(pathnameToCheck: PathnameToCheck, targetPathname: string): string {
    return `${getPositionMessage(pathnameToCheck.position)}Page (${targetPathname}) contains a link to ${chalk.bold(
        pathnameToCheck.pathname
    )} that does not exist.`;
}

function getPositionMessage(position: Position | undefined): string {
    if (position == null) {
        return "";
    }
    return `[${position.start.line}:${position.start.column}-${position.end.line}:${position.end.column}] `;
}

function toLatest(apiDefinition: APIV1Read.ApiDefinition) {
    const latest = ApiDefinition.ApiDefinitionV1ToLatest.from(apiDefinition, {
        useJavaScriptAsTypeScript: false,
        alwaysEnableJavaScriptFetch: false,
        usesApplicationJsonInFormDataValue: false
    }).migrate();

    return latest;
}

async function collectDescriptions(apiDefinition: ApiDefinition.ApiDefinition): Promise<string[]> {
    const descriptions: string[] = [];
    ApiDefinition.Transformer.descriptions((description) => {
        if (typeof description === "string") {
            descriptions.push(description);
        }

        return description;
    }).apiDefinition(apiDefinition);
    return descriptions;
}
