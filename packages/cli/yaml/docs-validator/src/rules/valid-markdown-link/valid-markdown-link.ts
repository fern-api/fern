import { noop } from "@fern-api/core-utils";
import { convertIrToApiDefinition, DocsDefinitionResolver } from "@fern-api/docs-resolver";
import { APIV1Read, ApiDefinition, FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, join, RelativeFilePath, relative } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { createLogger } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { randomUUID } from "crypto";
import path from "path";

import { SourceResolverImpl } from "../../../../../cli-source-resolver/src/SourceResolverImpl";
import { Rule, RuleViolation } from "../../Rule";
import { checkIfPathnameExists } from "./check-if-pathname-exists";
import { collectPathnamesToCheck, PathnameToCheck } from "./collect-pathnames";
import { getInstanceUrls, removeLeadingSlash, toBaseUrl } from "./url-utils";

const NOOP_CONTEXT = createMockTaskContext({ logger: createLogger(noop) });

export const ValidMarkdownLinks: Rule = {
    name: "valid-markdown-links",
    create: async ({ workspace, apiWorkspaces, ossWorkspaces }) => {
        const instanceUrls = getInstanceUrls(workspace);

        const url = instanceUrls[0] ?? "http://localhost";
        const baseUrl = toBaseUrl(instanceUrls[0] ?? "http://localhost");

        const docsDefinitionResolver = new DocsDefinitionResolver(
            url,
            workspace,
            ossWorkspaces,
            apiWorkspaces,
            NOOP_CONTEXT,
            undefined, // editThisPage
            undefined, // uploadFiles
            undefined, // registerApi
            undefined // targetAudiences - not applicable for validation
        );

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

                // Find all matches in the Markdown text
                const { pathnamesToCheck, violations } = collectPathnamesToCheck(content, {
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
                            baseUrl
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
                    audiences: config.audiences ? { type: "select", audiences: config.audiences } : { type: "all" },
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
                                const exists = await checkIfPathnameExists({
                                    pathname: pathnameToCheck.pathname,
                                    markdown: pathnameToCheck.markdown,
                                    workspaceAbsoluteFilePath: workspace.absoluteFilePath,
                                    pageSlugs: visitableSlugs,
                                    absoluteFilePathsToSlugs,
                                    redirects: workspace.config.redirects,
                                    baseUrl
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
                    }
                }

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
