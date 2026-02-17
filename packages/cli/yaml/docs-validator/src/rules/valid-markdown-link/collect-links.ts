import { readFileSync } from "node:fs";
import {
    extractAttributeValueLiteral,
    extractSingleLiteral,
    isMdxJsxAttribute,
    parseMarkdownToTree,
    walkEstreeJsxAttributes
} from "@fern-api/docs-markdown-utils";
import { AbsoluteFilePath, dirname, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import type { Node as EstreeNode } from "estree";
import { walk } from "estree-walker";
import type { Root as HastRoot } from "hast";
import { toHast } from "mdast-util-to-hast";
import type { Position } from "unist";
import { visit } from "unist-util-visit";

const MDX_NODE_TYPES = [
    "mdxFlowExpression",
    "mdxJsxFlowElement",
    "mdxJsxTextElement",
    "mdxTextExpression",
    "mdxjsEsm"
] as const;

interface HastLink {
    href: string;
    sourceFilepath?: AbsoluteFilePath;
    position?: Position;
}

interface HastSource {
    src: string;
    sourceFilepath?: AbsoluteFilePath;
    position?: Position;
}

export function collectLinksAndSources({
    readFile = (path) => readFileSync(path, "utf-8"),
    ...opts
}: {
    readFile?: (path: AbsoluteFilePath) => string;
    content: string;
    absoluteFilepath?: AbsoluteFilePath;
}): {
    links: HastLink[];
    sources: HastSource[];
} {
    const visitedAbsoluteFilepaths = new Set<AbsoluteFilePath>();

    // we'll use this queue to trace imported markdown files (e.g. via mdxjsEsm, or the <Markdown> component)
    // which are markdown snippets that should be checked for links as well.
    const contentQueue: {
        content: string;
        absoluteFilepath?: AbsoluteFilePath;
    }[] = [opts];

    const links: HastLink[] = [];
    const sources: HastSource[] = [];

    const LOOP_LIMIT = 1000;
    let loopCount = 0;
    do {
        loopCount++;
        if (loopCount > LOOP_LIMIT) {
            throw new Error("Infinite loop detected while collecting links and sources");
        }
        const popped = contentQueue.shift();
        if (popped == null) {
            break;
        }

        const { content, absoluteFilepath } = popped;

        // NOTE: we don't want to visit the same file multiple times
        if (absoluteFilepath != null) {
            if (visitedAbsoluteFilepaths.has(absoluteFilepath)) {
                throw new Error(`Circular import detected: ${absoluteFilepath}`);
            }
            visitedAbsoluteFilepaths.add(absoluteFilepath);
        }

        const mdast = parseMarkdownToTree(content);

        const hast = toHast(mdast, {
            allowDangerousHtml: true,
            passThrough: [...MDX_NODE_TYPES]
        }) as HastRoot;

        visit(hast, (node) => {
            // if mdxjsEsm imports from a .md or .mdx file, we'll treat it as if it was a markdown snippet
            // this doesn't handle plain javascript imports (which is outside of the scope of this rule)
            // TODO: should we verify that the imported file is actually used in the current page?
            if (node.type === "mdxjsEsm" && absoluteFilepath != null) {
                if (node.data?.estree) {
                    walk(node.data.estree, {
                        enter: (child) => {
                            if (
                                child.type === "ImportDeclaration" &&
                                child.source.type === "Literal" &&
                                typeof child.source.value === "string"
                            ) {
                                const importPath = RelativeFilePath.of(child.source.value);
                                const resolvedImportPath = resolve(dirname(absoluteFilepath), importPath);
                                // TODO: should we handle md files? what about other md extensions?
                                if (resolvedImportPath.endsWith(".mdx") || resolvedImportPath.endsWith(".md")) {
                                    contentQueue.push({
                                        content: readFile(resolvedImportPath),
                                        absoluteFilepath: resolvedImportPath
                                    });
                                }
                            }
                        }
                    });
                }
                return "skip";
            }

            if (node.type === "element") {
                const href = node.properties.href;
                if (typeof href === "string") {
                    links.push({ href, sourceFilepath: absoluteFilepath, position: node.position });
                }

                const src = node.properties.src;
                if (typeof src === "string") {
                    sources.push({ src, sourceFilepath: absoluteFilepath, position: node.position });
                }
            }

            function walkJsx(estree: EstreeNode, position: Position | undefined) {
                walkEstreeJsxAttributes(estree, {
                    src: (attr) => {
                        const src = extractSingleLiteral(attr.value);
                        if (typeof src === "string") {
                            sources.push({ src, sourceFilepath: absoluteFilepath, position });
                        }
                    },
                    href: (attr) => {
                        const href = extractSingleLiteral(attr.value);
                        if (typeof href === "string") {
                            links.push({ href, sourceFilepath: absoluteFilepath, position });
                        }
                    }
                });
            }

            if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
                const href = extractAttributeValueLiteral(
                    node.attributes.filter(isMdxJsxAttribute).find((attribute) => attribute.name === "href")?.value
                );

                const src = extractAttributeValueLiteral(
                    node.attributes.filter(isMdxJsxAttribute).find((attribute) => attribute.name === "src")?.value
                );

                // this is a special case for the <Markdown> component
                // which is our legacy support for markdown snippets. This should be deprecated soon.
                if (node.name === "Markdown") {
                    if (absoluteFilepath && typeof src === "string") {
                        const resolvedImportPath = resolve(dirname(absoluteFilepath), src);
                        contentQueue.push({
                            content: readFile(resolvedImportPath),
                            absoluteFilepath: resolvedImportPath
                        });
                    }

                    // Markdown component are special: they shouldn't have children, so we can skip them
                    return "skip";
                }

                // NOTE: this collects links if they are in the form of <a href="...">
                // if they're in the form of <a href={"..."} /> or <a {...{ href: "..." }} />, they will be ignored
                if (typeof href === "string") {
                    links.push({
                        href,
                        sourceFilepath: absoluteFilepath,
                        position: node.position
                    });
                }

                if (typeof src === "string") {
                    sources.push({
                        src,
                        sourceFilepath: absoluteFilepath,
                        position: node.position
                    });
                }

                node.attributes.forEach((attr) => {
                    if (
                        attr.type === "mdxJsxAttribute" &&
                        typeof attr.value !== "string" &&
                        attr.value != null &&
                        attr.value.data?.estree
                    ) {
                        walkJsx(attr.value.data.estree, attr.position);
                    } else if (attr.type === "mdxJsxExpressionAttribute" && attr.data?.estree) {
                        walkJsx(attr.data.estree, attr.position);
                    }
                });
            }

            if (node.type === "mdxFlowExpression" || node.type === "mdxTextExpression") {
                if (node.data?.estree) {
                    walkJsx(node.data.estree, node.position);
                }
            }
            return;
        });
    } while (contentQueue.length > 0);

    return { links, sources };
}

// acorns and other errors are being thrown when we parse the markdown
// so we'll just ignore these markdown files (or descriptions) for now.
// TODO: fix this
export function safeCollectLinksAndSources({
    content,
    absoluteFilepath
}: {
    content: string;
    absoluteFilepath?: AbsoluteFilePath;
}): {
    links: HastLink[];
    sources: HastSource[];
} {
    try {
        return collectLinksAndSources({ content, absoluteFilepath });
    } catch (error) {
        return { links: [], sources: [] };
    }
}
