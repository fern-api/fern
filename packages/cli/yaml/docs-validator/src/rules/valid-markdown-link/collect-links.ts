import { parseMarkdownToTree, getMarkdownFormat } from "@fern-api/docs-markdown-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { toHast } from "mdast-util-to-hast";
import type { Root as HastRoot } from "hast";
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
    position?: Position;
}

interface HastSource {
    src: string;
    position?: Position;
}

// TODO: this currently doesn't handle markdown snippets, but it should.
export function collectLinksAndSources({
    content,
    absoluteFilepath
}: {
    content: string;
    absoluteFilepath?: AbsoluteFilePath;
}): {
    links: HastLink[];
    sources: HastSource[];
} {
    const mdast = parseMarkdownToTree(content, absoluteFilepath ? getMarkdownFormat(absoluteFilepath) : "mdx");

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
