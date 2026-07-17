import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { noop } from "@fern-api/core-utils";
import { replaceReferencedMarkdown } from "@fern-api/docs-markdown-utils";
import { convertIrToApiDefinition } from "@fern-api/docs-resolver";
import { APIV1Read, ApiDefinition } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, RelativeFilePath, relative } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { createLogger } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";

import chalk from "chalk";
import { randomUUID } from "crypto";
import path from "path";
import { Rule, RuleViolation } from "../../Rule.js";
import { checkIfPathnameExists } from "./check-if-pathname-exists.js";
import { collectPathnamesToCheck, PathnameToCheck } from "./collect-pathnames.js";
import { resolveDocsNavigation } from "./resolve-docs-navigation.js";

// Quiet task context used for markdown snippet resolution (`replaceReferencedMarkdown`)
// and API workspace conversion, so validation doesn't emit resolver progress noise.
const NOOP_CONTEXT = createMockTaskContext({ logger: createLogger(noop) });

export const ValidMarkdownLinks: Rule = {
    name: "valid-markdown-links",
    create: async ({ workspace, apiWorkspaces, ossWorkspaces }) => {
        const { instanceUrls, baseUrl, visitableSlugs, absoluteFilePathsToSlugs, versionSlugs, productSlugs } =
            await resolveDocsNavigation({ workspace, apiWorkspaces, ossWorkspaces });

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

                const apiReferenceTitle = typeof config.api === "string" ? config.api : "API Reference";

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

                        // API descriptions have no source-page context, so `exists` may be an
                        // empty array. Emit at least one violation either way; otherwise broken
                        // links in endpoint, type, property, etc. docs are silently dropped
                        // (see FER-10165).
                        const numBrokenSourceContexts = exists.length > 0 ? exists.length : 1;
                        return Array.from({ length: numBrokenSourceContexts }, () => {
                            const [message, relFilePath] = createApiReferenceLinkViolationMessage({
                                pathnameToCheck,
                                apiReferenceTitle
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

/**
 * Build a violation message for a broken link found inside an API Reference
 * description (e.g. an endpoint, type, property, or parameter `docs` / OpenAPI
 * `description` field).
 *
 * Descriptions in API definitions are not tracked with source positions in the
 * IR, so we can't point the user at a specific file:line:column the way we do
 * for markdown pages. Surface the API Reference title instead so authors at
 * least know which navigation section to look in.
 */
function createApiReferenceLinkViolationMessage({
    pathnameToCheck,
    apiReferenceTitle
}: {
    pathnameToCheck: PathnameToCheck;
    apiReferenceTitle: string;
}): [msg: string, relFilePath: RelativeFilePath] {
    const msg = `broken link to ${chalk.bold(pathnameToCheck.pathname)} in ${apiReferenceTitle} description`;
    return [msg, RelativeFilePath.of("")];
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
