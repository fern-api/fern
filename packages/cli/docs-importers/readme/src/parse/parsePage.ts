import { Logger } from "@fern-api/logger";
import type { Root as HastRoot } from "hast";
import type { Root as MdastRoot } from "mdast";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { CONTINUE, EXIT, visit } from "unist-util-visit";

import { unifiedRemoveBreaks } from "../cleaners/breaks";
import { unifiedRemoveClassNames } from "../cleaners/className";
import { remarkRemoveEmptyEmphases } from "../cleaners/emptyEmphasis";
import { unifiedRemoveEmptyParagraphs } from "../cleaners/emptyParagraphs";
import { remarkProperlyFormatEmphasis } from "../cleaners/formatEmphasis";
import { removeHastComments } from "../cleaners/hastComments";
import { convertHeaderLinksToText } from "../cleaners/link";
import { remarkRemoveBottomMetadata } from "../cleaners/metadata";
import { unifiedRemoveNestedRoots } from "../cleaners/nestedRoots";
import { unifiedRemovePositions } from "../cleaners/position";
import { unifiedRemoveSuggestEdits } from "../cleaners/suggestEdits";
import { remarkRemoveCodeBlocksInCells } from "../cleaners/tableCells";
import { unifiedRemoveTableOfContents } from "../cleaners/toc";
import { remarkRemoveUpdatedAt } from "../cleaners/updatedAt";
import {
    createAccordion,
    createAccordionGroup,
    createCallout,
    createCard,
    createCardGroup,
    createCodeGroup,
    createEmbed,
    createFrame,
    createTabs
} from "../customComponents/create";
import { rehypeToRemarkCustomComponents } from "../customComponents/plugin";
import { selectiveRehypeRemark } from "../customComponents/selective";
import { getImagesUsedInFile } from "../extract/images";
import { findSourceElement } from "../extract/source";
import { getDescriptionFromRoot, getTitleFromHeading } from "../extract/title";
import type { Result } from "../types/result";
import { formatPageWithFrontmatter } from "../utils/files/file";
import { htmlToHast } from "../utils/hast";
import { normalizePath } from "../utils/strings";

export declare namespace parsePage {
    interface Args {
        logger: Logger;
        html: string;
        url: URL;
    }

    interface Output {
        mdx: string;
        images: getImagesUsedInFile.Output;
    }
}

export async function parsePage({ logger, html, url }: parsePage.Args): Promise<Result<parsePage.Output>> {
    // Remove secondary navigation (sidebar) from HTML before processing
    const removeSecondaryNavigation = (html: string): string => {
        // Create a temporary DOM element to manipulate the HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;

        // Find and remove the sidebar navigation
        const sidebar = tempDiv.querySelector("nav.rm-Sidebar");
        if (sidebar) {
            sidebar.remove();
        }

        return tempDiv.innerHTML;
    };

    // If we're in a browser environment, use DOM manipulation
    // Otherwise, use a simple regex-based approach for Node.js environment
    const cleanedHtml =
        typeof document !== "undefined"
            ? removeSecondaryNavigation(html)
            : html.replace(/<nav[^>]*class="[^"]*rm-Sidebar[^"]*"[^>]*>[\s\S]*?<\/nav>/gi, "");

    html = cleanedHtml;

    const hast = htmlToHast(html);
    removeHastComments(hast);

    const urlStr = url.toString();
    const source = findSourceElement(hast);

    if (!source) {
        return { success: false, data: undefined };
    }

    const contentAsRoot: HastRoot = {
        type: "root",
        children: [source]
    };

    const mdastTree: MdastRoot = unified()
        .use(unifiedRemoveBreaks)
        .use(unifiedRemoveTableOfContents)
        .use(unifiedRemoveSuggestEdits)
        .use(createCard)
        .use(createAccordion)
        .use(createFrame)
        .use(createCallout)
        .use(createCardGroup)
        .use(createAccordionGroup)
        .use(createCodeGroup)
        .use(createEmbed)
        .use(createTabs)
        .use(unifiedRemoveClassNames)
        .use(unifiedRemoveEmptyParagraphs)
        .use(unifiedRemovePositions)
        .use(selectiveRehypeRemark)
        .use(rehypeToRemarkCustomComponents)
        .use(convertHeaderLinksToText)
        .use(unifiedRemoveNestedRoots)
        .use(remarkRemoveBottomMetadata)
        .use(remarkRemoveUpdatedAt)
        .use(remarkRemoveEmptyEmphases)
        .use(remarkProperlyFormatEmphasis)
        .use(remarkRemoveCodeBlocksInCells)
        .runSync(contentAsRoot) as MdastRoot;

    const images = await getImagesUsedInFile(mdastTree, url);

    // First try to get title and description from HTML
    let title = "";
    let description = "";

    // Try to extract title from HTML
    visit(hast, "element", function (node) {
        if (node.tagName === "title") {
            visit(node, "text", function (textNode) {
                title = textNode.value.trim();
                return EXIT;
            });
            return title ? EXIT : CONTINUE;
        }
        return CONTINUE;
    });

    // Try to extract description from meta tags
    visit(hast, "element", function (node) {
        if (
            node.tagName === "meta" &&
            node.properties &&
            node.properties.name === "description" &&
            node.properties.content
        ) {
            description = node.properties.content.toString();
            return EXIT;
        }
        return CONTINUE;
    });

    // Fall back to extracting from mdast if not found in HTML
    if (!title) {
        title = getTitleFromHeading(mdastTree);
    }

    if (!description) {
        description = getDescriptionFromRoot(mdastTree);
    }

    const slug = normalizePath(url.pathname);

    try {
        const mdxContent = unified().use(remarkMdx).use(remarkGfm).use(remarkStringify).stringify(mdastTree);

        // Check if the mdx content starts with a h1 that matches the title
        // If so, remove that heading to avoid duplication
        const titleHeadingPattern = new RegExp(`^# ${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\n`, "m");
        let mdxContentNoDuplicateTitleSubtitle = mdxContent.replace(titleHeadingPattern, "");

        // Check if the mdx content starts with a paragraph that matches the description
        // If so, remove that paragraph to avoid duplication
        if (description) {
            const firstParagraphPattern = /^([^#\n][^\n]*\n)/m;

            const firstParagraph = mdxContentNoDuplicateTitleSubtitle.match(firstParagraphPattern)?.[1]?.trim();

            if (
                firstParagraph &&
                (firstParagraph === description ||
                    firstParagraph.replace(/\s+/g, " ") === description.replace(/\s+/g, " "))
            ) {
                // Remove the first paragraph if it matches the description
                // This handles cases where the description might have different whitespace formatting
                const mdxContentWithoutDescription = mdxContentNoDuplicateTitleSubtitle.replace(
                    firstParagraphPattern,
                    ""
                );
                mdxContentNoDuplicateTitleSubtitle = mdxContentWithoutDescription;
            }
        }

        const resultStr = String(mdxContentNoDuplicateTitleSubtitle).replace(/\n{3,}/g, "\n\n");

        const mdx = formatPageWithFrontmatter({
            title,
            description,
            markdown: resultStr,
            url: urlStr,
            slug
        });

        return {
            success: true,
            data: {
                mdx,
                images
            }
        };
        // biome-ignore lint/suspicious/noEmptyBlockStatements: allow
    } catch (error) {}

    return { success: false };
}
