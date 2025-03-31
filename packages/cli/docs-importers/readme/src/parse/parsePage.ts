import type { Root as HastRoot } from "hast";
import type { Root as MdastRoot } from "mdast";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkStringify from "remark-stringify";
import { unified } from "unified";

import { TaskContext } from "@fern-api/task-context";

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
import { downloadImagesFromFile } from "../extract/images";
import { findSourceElement } from "../extract/source";
import { getDescriptionFromRoot, getTitleFromHeading } from "../extract/title";
import type { Result } from "../types/result";
import { writePage } from "../utils/files/file";
import { htmlToHast } from "../utils/hast";
import { normalizePath, removeTrailingSlash } from "../utils/strings";

export async function parsePage(
    context: TaskContext,
    html: string,
    url: string | URL,
    opts: {
        externalLink: boolean;
        rootPath?: string;
    } = { externalLink: false }
): Promise<Result<[string, string]>> {
    let urlObj = new URL(url);

    if (opts.externalLink) {
        const filename = html;
        const filenameWithExt = `${filename}.mdx`;
        writePage({
            filename: filenameWithExt,
            title: "",
            description: "",
            markdown: "",
            url: urlObj.toString()
        });
        return { success: true, data: [urlObj.toString(), filename] };
    }

    const hast = htmlToHast(html);
    removeHastComments(hast);

    const urlStr = urlObj.toString();
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

    await downloadImagesFromFile(mdastTree, url);

    // First try to get title and description from HTML
    let title = "";
    let description = "";
    
    // Try to extract title from HTML
    visit(hast, "element", function(node) {
        if (node.tagName === "title") {
            visit(node, "text", function(textNode) {
                title = textNode.value.trim();
                return EXIT;
            });
            return title ? EXIT : CONTINUE;
        }
        return CONTINUE;
    });
    
    // Try to extract description from meta tags
    visit(hast, "element", function(node) {
        if (node.tagName === "meta" && 
            node.properties && 
            node.properties.name === "description" && 
            node.properties.content) {
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
    
    const slug = normalizePath(urlObj.pathname);
    

    try {
        const mdxContent = unified().use(remarkMdx).use(remarkGfm).use(remarkStringify).stringify(mdastTree);
        const resultStr = String(mdxContent).replace(/\n{3,}/g, "\n\n");

        if (opts.rootPath) {
            urlObj = new URL(opts.rootPath, urlObj.origin);
        } else if (urlObj.origin === removeTrailingSlash(urlObj.toString())) {
            urlObj = new URL("home", new URL(urlObj).origin);
        }

        writePage({
            filename: url,
            title,
            description,
            markdown: resultStr,
            slug
        });
        return {
            success: true,
            data: opts.rootPath ? [normalizePath(new URL(urlStr).pathname), opts.rootPath] : undefined
        };
    } catch (error) {
        context.logger.debug(`Error parsing page ${urlStr}: ${error}`);
        return { success: false, data: [urlStr, ""] };
    }
}
