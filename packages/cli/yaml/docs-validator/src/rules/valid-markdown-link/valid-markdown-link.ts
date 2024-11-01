import { AbsoluteFilePath, dirname, doesPathExist, join, RelativeFilePath, cwd, relativize } from "@fern-api/fs-utils";
import { Rule, RuleViolation } from "../../Rule";
import { DocsDefinitionResolver, wrapWithHttps } from "@fern-api/docs-resolver";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import { createMockTaskContext } from "@fern-api/task-context";
import { convertDbDocsConfigToRead, convertDocsDefinitionToDb, FernNavigation } from "@fern-api/fdr-sdk";
import { getMarkdownFormat, parseMarkdownToTree } from "@fern-api/docs-markdown-utils";
import { visit } from "unist-util-visit";
import { toHast } from "mdast-util-to-hast";
import type { Root as HastRoot } from "hast";
import type { Position } from "unist";
import { stripAnchorsAndSearchParams, addLeadingSlash, removeLeadingSlash } from "./url-utils";
import { getRedirectForPath } from "./redirect-for-path";
import chalk from "chalk";

// this should match any link that starts with a protocol (e.g. http://, https://, mailto:, etc.)
const EXTERNAL_LINK_PATTERN = /^(?:[a-z+]+:)/gi;

interface PathnameToCheck {
    markdown: boolean;
    pathname: string;
    position?: Position;
}

export const ValidMarkdownLinks: Rule = {
    name: "valid-markdown-links",
    create: async ({ workspace, loadApiWorkspace }) => {
        const instanceUrls = getInstanceUrls(workspace);

        const url = instanceUrls[0] ?? "http://localhost";

        const docsDefinitionResolver = new DocsDefinitionResolver(
            url,
            workspace,
            loadApiWorkspace,
            createMockTaskContext()
        );

        const resolvedDocsDefinition = await docsDefinitionResolver.resolve();

        const db = convertDocsDefinitionToDb({
            writeShape: resolvedDocsDefinition,
            files: {}
        });

        const readShape = convertDbDocsConfigToRead({ dbShape: db.config });

        const baseUrl = toBaseUrl(url);

        // TODO: this is a bit of a hack to get the navigation tree. We should probably just use the navigation tree
        // from the docs definition resolver, once there's a light way to retrieve it.
        const root = FernNavigation.utils.toRootNode({
            baseUrl,
            definition: {
                algoliaSearchIndex: undefined,
                pages: resolvedDocsDefinition.pages,
                apis: docsDefinitionResolver.apiDefinitions,
                files: {},
                filesV2: {},
                jsFiles: resolvedDocsDefinition.jsFiles,
                id: undefined,
                search: { type: "legacyMultiAlgoliaIndex", algoliaIndex: undefined },
                config: readShape
            },
            lightModeEnabled: true
        });

        // all the page slugs in the docs:
        const collector = FernNavigation.NodeCollector.collect(root);

        const pageSlugs = new Set<string>();
        const absoluteFilePathsToSlugs = new Map<AbsoluteFilePath, string[]>();
        collector.slugMap.forEach((node, slug) => {
            if (node == null || !FernNavigation.isPage(node)) {
                return;
            }

            pageSlugs.add(slug);

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
                // if this happens, this probably means that the current file is omitted from the docs navigation
                // most likely due to a slug collision. This should be handled in a different rule.
                if (!absoluteFilePathsToSlugs.has(absoluteFilepath)) {
                    return [];
                }

                // Find all matches in the Markdown text
                const violations: RuleViolation[] = [];

                const { links, sources } = collectLinksAndSources({ content, absoluteFilepath });

                const pathnamesToCheck: PathnameToCheck[] = [];

                links.forEach((link) => {
                    if (link.href.trimStart().match(EXTERNAL_LINK_PATTERN)) {
                        if (!link.href.trimStart().startsWith("http")) {
                            // we don't need to check if it exists if it's not an http link
                            return;
                        }

                        try {
                            // test if the link is a valid WHATWG URL (otherwise `new URL(link.href)` will throw)
                            const url = new URL(link.href);

                            // if the link does not point to an instance URL, we don't need to check if it exists internally
                            if (!instanceUrls.some((url) => link.href.includes(url))) {
                                // TODO: potentially do a `fetch` check here to see if the external link is valid?
                                return;
                            }

                            pathnamesToCheck.push({
                                pathname: url.pathname,
                                position: link.position,
                                markdown: true
                            });
                        } catch (error) {
                            violations.push({
                                severity: "warning",
                                message: `Invalid URL: ${link.href}`
                            });
                        }
                        return;
                    }

                    const pathname = stripAnchorsAndSearchParams(link.href);

                    // empty "" is actually a valid path, so we don't need to check it
                    if (pathname.trim() === "") {
                        return;
                    }

                    pathnamesToCheck.push({
                        pathname,
                        position: link.position,
                        markdown: true
                    });
                });

                sources.forEach((source) => {
                    if (source.src.match(EXTERNAL_LINK_PATTERN)) {
                        try {
                            // test if the link is a valid WHATWG URL (otherwise `new URL(source.src)` will throw)
                            new URL(source.src);
                        } catch (error) {
                            violations.push({
                                severity: "warning" as const,
                                message: `Invalid URL: ${source.src}`
                            });
                            return;
                        }
                    } else {
                        pathnamesToCheck.push({
                            pathname: source.src,
                            position: source.position,
                            markdown: false
                        });
                    }
                });

                const pathToCheckViolations = await Promise.all(
                    pathnamesToCheck.map(async (pathnameToCheck) => {
                        const exists = await checkIfPathnameExists(pathnameToCheck.pathname, {
                            markdown: pathnameToCheck.markdown,
                            absoluteFilepath,
                            workspaceAbsoluteFilePath: workspace.absoluteFilePath,
                            pageSlugs,
                            absoluteFilePathsToSlugs,
                            redirects: workspace.config.redirects,
                            baseUrl: toBaseUrl(instanceUrls[0] ?? "http://localhost")
                        });

                        if (exists === true) {
                            return [];
                        }

                        return exists.map((brokenPathname) => {
                            const message = createLinkViolationMessage(
                                pathnameToCheck,
                                absoluteFilepath,
                                brokenPathname
                            );
                            // console.warn(message);
                            return {
                                severity: "warning" as const,
                                message
                            };
                        });
                    })
                );

                return [...violations, ...pathToCheckViolations.flat()];
            }
        };
    }
};

function createLinkViolationMessage(
    pathnameToCheck: PathnameToCheck,
    absoluteFilepath: AbsoluteFilePath,
    targetPathname: string
): string {
    return `${relativize(cwd(), absoluteFilepath)}\n\t${getPositionMessage(
        pathnameToCheck.position
    )}Link does not exist: ${chalk.bold(pathnameToCheck.pathname)} ${chalk.gray(
        `(link will be broken on ${targetPathname})`
    )}`;
}

function getPositionMessage(position: Position | undefined): string {
    if (position == null) {
        return "";
    }
    return `[${position.start.line}:${position.start.column}-${position.end.line}:${position.end.column}] `;
}

/**
 * Checks if the given path exists in the docs.
 *
 * For a given pathname, there's two scenarios:
 * 1. the pathname is a slug to a page in the docs (e.g. `/docs/my-page`)
 * 2. the pathname is a path to a file in the docs (e.g. `/docs/my-file.md`)
 *
 * Crucially, the current file may referenced by two slugs, so if the target pathname contains a relativized path,
 * we will need to check that if the relativized paths can be found on all of the slugs for the current file.
 */
async function checkIfPathnameExists(
    pathname: string,
    {
        markdown,
        absoluteFilepath,
        workspaceAbsoluteFilePath,
        pageSlugs,
        absoluteFilePathsToSlugs,
        redirects = [],
        baseUrl
    }: {
        markdown: boolean;
        absoluteFilepath: AbsoluteFilePath;
        workspaceAbsoluteFilePath: AbsoluteFilePath;
        pageSlugs: Set<string>;
        absoluteFilePathsToSlugs: Map<AbsoluteFilePath, string[]>;
        redirects?: {
            source: string;
            destination: string;
            permanent?: boolean;
        }[];
        baseUrl: {
            domain: string;
            basePath?: string;
        };
    }
): Promise<true | string[]> {
    const slugs = absoluteFilePathsToSlugs.get(absoluteFilepath) ?? [];

    // base case: empty pathname is valid
    if (pathname.trim() === "") {
        return true;
    }

    // if the pathname starts with `/`, it must either be a slug or a file in the current workspace
    if (pathname.startsWith("/")) {
        // only check slugs if the file is expected to be a markdown file
        if (markdown && pageSlugs.has(removeLeadingSlash(withRedirects(pathname, baseUrl, redirects)))) {
            return true;
        }

        if (
            await doesPathExist(
                join(workspaceAbsoluteFilePath, RelativeFilePath.of(removeLeadingSlash(pathname))),
                "file"
            )
        ) {
            return true;
        }

        return slugs.map((slug) => addLeadingSlash(slug));
    }

    // if the pathname does not start with a `/`, it is a relative path.
    // first, we'll check if the pathname is a relativized path
    const relativizedPathname = join(dirname(absoluteFilepath), RelativeFilePath.of(pathname));

    if (await doesPathExist(relativizedPathname, "file")) {
        return true;
    }

    // if this file isn't expected to be a markdown file, we don't have to check the slugs
    if (!markdown) {
        return slugs.map((slug) => addLeadingSlash(slug));
    }

    // if that fails, we need to check if the path exists against all of the slugs for the current file

    const brokenSlugs: string[] = [];
    for (const slug of slugs) {
        const url = new URL(`/${slug}`, wrapWithHttps(baseUrl.domain));
        const targetSlug = withRedirects(new URL(pathname, url).pathname, baseUrl, redirects);

        if (!pageSlugs.has(targetSlug)) {
            brokenSlugs.push(slug);
        }
    }

    return brokenSlugs.length > 0 ? brokenSlugs : true;
}

function withRedirects(
    pathname: string,
    baseUrl: { domain: string; basePath?: string },
    redirects: { source: string; destination: string; permanent?: boolean }[]
) {
    const result = getRedirectForPath(pathname, baseUrl, redirects);
    if (result == null) {
        return pathname;
    }
    return result.redirect.destination;
}

export interface MarkdownLink {
    path: string;
    absolutePath: AbsoluteFilePath;
}

const MDX_NODE_TYPES = [
    "mdxFlowExpression",
    "mdxJsxFlowElement",
    "mdxJsxTextElement",
    "mdxTextExpression",
    "mdxjsEsm"
] as const;

interface HastLink {
    href: string;
    position?: Position;
}

interface HastSource {
    src: string;
    position?: Position;
}

export function collectLinksAndSources({
    content,
    absoluteFilepath
}: {
    content: string;
    absoluteFilepath: AbsoluteFilePath;
}): {
    links: HastLink[];
    sources: HastSource[];
} {
    const mdast = parseMarkdownToTree(content, getMarkdownFormat(absoluteFilepath));

    const hast = toHast(mdast, {
        allowDangerousHtml: true,
        passThrough: [...MDX_NODE_TYPES]
    }) as HastRoot;

    const links: HastLink[] = [];
    const sources: HastSource[] = [];

    visit(hast, (node) => {
        if (node.type === "element") {
            const href = node.properties.href;
            if (typeof href === "string") {
                links.push({ href, position: node.position });
            }

            const src = node.properties.src;
            if (typeof src === "string") {
                sources.push({ src, position: node.position });
            }
        }

        if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
            const hrefAttribute = node.attributes.find(
                (attribute) => attribute.type === "mdxJsxAttribute" && attribute.name === "href"
            );

            // NOTE: this collects links if they are in the form of <a href="...">
            // if they're in the form of <a href={"..."} /> or <a {...{ href: "..." }} />, they will be ignored
            if (hrefAttribute != null && typeof hrefAttribute.value === "string") {
                links.push({ href: hrefAttribute.value, position: node.position });
            }

            const srcAttribute = node.attributes.find(
                (attribute) => attribute.type === "mdxJsxAttribute" && attribute.name === "src"
            );
            if (srcAttribute != null && typeof srcAttribute.value === "string") {
                sources.push({ src: srcAttribute.value, position: node.position });
            }
        }
    });

    return { links, sources };
}

function getInstanceUrls(workspace: DocsWorkspace): string[] {
    const urls: string[] = [];

    workspace.config.instances.forEach((instance) => {
        urls.push(instance.url);

        if (typeof instance.customDomain === "string") {
            urls.push(instance.customDomain);
        } else if (Array.isArray(instance.customDomain)) {
            urls.push(...instance.customDomain);
        }
    });

    return urls;
}

function toBaseUrl(domain: string): { domain: string; basePath: string | undefined } {
    const url = new URL(wrapWithHttps(domain));
    return {
        domain: url.host,
        basePath: url.pathname === "/" || url.pathname === "" ? undefined : url.pathname
    };
}
