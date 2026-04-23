import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { noop } from "@fern-api/core-utils";
import { replaceReferencedMarkdown } from "@fern-api/docs-markdown-utils";
import { convertIrToApiDefinition, DocsDefinitionResolver } from "@fern-api/docs-resolver";
import { APIV1Read, ApiDefinition, FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, join, RelativeFilePath, relative } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { createLogger } from "@fern-api/logger";
import { CliError, createMockTaskContext } from "@fern-api/task-context";

import chalk from "chalk";
import { randomUUID } from "crypto";
import path from "path";
import { Rule, RuleViolation } from "../../Rule.js";
import { checkIfPathnameExists } from "./check-if-pathname-exists.js";
import { collectPathnamesToCheck, PathnameToCheck } from "./collect-pathnames.js";
import { getInstanceUrls, removeLeadingSlash, toBaseUrl } from "./url-utils.js";

const NOOP_CONTEXT = createMockTaskContext({ logger: createLogger(noop) });

// The FDR SDK types config.root as {} via zod inference, but at runtime it is FernNavigation.V1.RootNode.
// This type guard checks the "type" discriminant to safely narrow the type without a blind cast.
function isV1RootNode(value: object): value is FernNavigation.V1.RootNode {
    return "type" in value && (value as { type: unknown }).type === "root";
}

export const ValidMarkdownLinks: Rule = {
    name: "valid-markdown-links",
    create: async ({ workspace, apiWorkspaces, ossWorkspaces }) => {
        const instanceUrls = getInstanceUrls(workspace);

        const url = instanceUrls[0] ?? "http://localhost";
        const baseUrl = toBaseUrl(instanceUrls[0] ?? "http://localhost");

        const docsDefinitionResolver = new DocsDefinitionResolver({
            domain: url,
            docsWorkspace: workspace,
            ossWorkspaces,
            apiWorkspaces,
            taskContext: NOOP_CONTEXT,
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

        // Collect version and product slugs for context-aware absolute link resolution
        const versionSlugs = collector.getVersionNodes().map((v) => v.slug);
        const productSlugs = collector
            .getProductNodes()
            .filter(FernNavigation.isInternalProductNode)
            .map((p) => p.slug);

        const specialDocPages = ["/llms-full.txt", "/llms.txt"];

        for (const specialPage of specialDocPages) {
            const pageWithBasePath = baseUrl.basePath
                ? `${removeLeadingSlash(baseUrl.basePath)}${specialPage}`
                : removeLeadingSlash(specialPage);
            visitableSlugs.add(pageWithBasePath);
        }

        return {
            markdownPage: async ({ content, absoluteFilepath }) => {
                const slugs = absoluteFilePathsToSlugs.get(absoluteFilepath);

                // if this happens, this probably means that the current file is omitted from the docs navigation
                // most likely due to a slug collision. This should be handled in a different rule.
                if (!slugs || slugs.length === 0) {
                    return [];
                }

                const { markdown: resolvedContent } = await replaceReferencedMarkdown({
                    markdown: content,
                    absolutePathToFernFolder: workspace.absoluteFilePath,
                    absolutePathToMarkdownFile: absoluteFilepath,
                    context: NOOP_CONTEXT
                });

                // Find all matches in the Markdown text
                const { pathnamesToCheck, violations } = collectPathnamesToCheck(resolvedContent, {
                    absoluteFilepath,
                    instanceUrls
                });

                const pathToCheckViolations = await Promise.all(
                    pathnamesToCheck.map(async (pathnameToCheck) => {
                        const exists = await checkIfPathnameExists({
                            pathname: pathnameToCheck.pathname,
                            markdown: pathnameToCheck.markdown,
                            absoluteFilepath,
                            workspaceAbsoluteFilePath: workspace.absoluteFilePath,
                            pageSlugs: visitableSlugs,
                            absoluteFilePathsToSlugs,
                            redirects: workspace.config.redirects,
                            baseUrl,
                            versionSlugs,
                            productSlugs
                        });

                        if (exists === true) {
                            return [];
                        }

                        return exists.map((brokenPathname) => {
                            const [message, relFilePath] = createLinkViolationMessage({
                                pathnameToCheck,
                                targetPathname: brokenPathname,
                                absoluteFilepathToWorkspace: workspace.absoluteFilePath
                            });
                            return {
                                name: ValidMarkdownLinks.name,
                                severity: "error" as const,
                                message,
                                relativeFilepath: relFilePath
                            };
                        });
                    })
                );

                return [...violations, ...pathToCheckViolations.flat()];
            },
            apiSection: async ({ workspace: apiWorkspace, config }) => {
                const fernWorkspace = await apiWorkspace.toFernWorkspace(
                    { context: NOOP_CONTEXT },
                    { enableUniqueErrorsPerEndpoint: true, detectGlobalHeaders: false }
                );
                const ir = generateIntermediateRepresentation({
                    workspace: fernWorkspace,
                    audiences: config.audiences
                        ? {
                              type: "select",
                              audiences: Array.isArray(config.audiences) ? config.audiences : [config.audiences]
                          }
                        : { type: "all" },
                    generationLanguage: undefined,
                    keywords: undefined,
                    smartCasing: false,
                    exampleGeneration: { disabled: false },
                    readme: undefined,
                    version: undefined,
                    packageName: undefined,
                    context: NOOP_CONTEXT,
                    sourceResolver: new SourceResolverImpl(NOOP_CONTEXT, fernWorkspace)
                });
                const api = toLatest(
                    convertIrToApiDefinition({ ir, apiDefinitionId: randomUUID(), context: NOOP_CONTEXT })
                );

                const uniqueDescriptions = collectUniqueDescriptions(api);
                const violations: RuleViolation[] = [];
                const uniquePathnames = new Map<string, PathnameToCheck>();

                // Parse all unique descriptions to find link pathnames, then deduplicate pathnames
                for (const description of uniqueDescriptions) {
                    const { pathnamesToCheck, violations: descriptionViolations } = collectPathnamesToCheck(
                        description,
                        { instanceUrls }
                    );
                    violations.push(...descriptionViolations);
                    for (const p of pathnamesToCheck) {
                        if (!uniquePathnames.has(p.pathname)) {
                            uniquePathnames.set(p.pathname, p);
                        }
                    }
                }

                // Batch-check all unique pathnames
                const pathToCheckViolations = await Promise.all(
                    [...uniquePathnames.values()].map(async (pathnameToCheck) => {
                        const exists = await checkIfPathnameExists({
                            pathname: pathnameToCheck.pathname,
                            markdown: pathnameToCheck.markdown,
                            workspaceAbsoluteFilePath: workspace.absoluteFilePath,
                            pageSlugs: visitableSlugs,
                            absoluteFilePathsToSlugs,
                            redirects: workspace.config.redirects,
                            baseUrl,
                            versionSlugs,
                            productSlugs
                        });

                        if (exists === true) {
                            return [];
                        }

                        return exists.map((brokenPathname) => {
                            const [message, relFilePath] = createLinkViolationMessage({
                                pathnameToCheck,
                                targetPathname: brokenPathname,
                                absoluteFilepathToWorkspace: workspace.absoluteFilePath
                            });
                            return {
                                name: ValidMarkdownLinks.name,
                                severity: "error" as const,
                                message,
                                relFilepath: relFilePath
                            };
                        });
                    })
                );

                violations.push(...pathToCheckViolations.flat());

                return violations;
            }
        };
    }
};

function createLinkViolationMessage({
    pathnameToCheck,
    targetPathname,
    absoluteFilepathToWorkspace
}: {
    pathnameToCheck: PathnameToCheck;
    targetPathname: string;
    absoluteFilepathToWorkspace: AbsoluteFilePath;
}): [msg: string, relFilePath: RelativeFilePath] {
    let msg = `${targetPathname} links to non-existent page ${chalk.bold(pathnameToCheck.pathname)}`;
    const { position, sourceFilepath } = pathnameToCheck;
    if (sourceFilepath == null || position == null) {
        return [msg, RelativeFilePath.of("")];
    }

    msg = `broken link to ${chalk.bold(pathnameToCheck.pathname)}`;
    if (pathnameToCheck.pathname.length > 0 && !path.isAbsolute(pathnameToCheck.pathname)) {
        // for relative paths, print out the resolved path that is broken
        msg += ` (resolved path: ${path.join(targetPathname, pathnameToCheck.pathname)})`;
    }
    const relativeFilepath = relative(absoluteFilepathToWorkspace, sourceFilepath);
    msg += `\n\tfix here: ${relativeFilepath}:${position.start.line}:${position.start.column}`;
    return [msg, relativeFilepath];
}

function toLatest(apiDefinition: APIV1Read.ApiDefinition) {
    const latest = ApiDefinition.ApiDefinitionV1ToLatest.from(apiDefinition).migrate();

    return latest;
}

function collectUniqueDescriptions(apiDefinition: ApiDefinition.ApiDefinition) {
    const set = new Set<string>();
    ApiDefinition.Transformer.descriptions((description) => {
        set.add(description);
        return description;
    }).apiDefinition(apiDefinition);
    return set;
}
