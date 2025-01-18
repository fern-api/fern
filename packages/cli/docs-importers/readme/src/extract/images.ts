import type { Root as MdastRoot } from "mdast";
import type { MdxJsxAttribute } from "mdast-util-mdx-jsx";
import { CONTINUE, visit } from "unist-util-visit";

import type { Result } from "../types/result.js";
import { downloadImage } from "../utils/files/images.js";

export async function downloadImagesFromFile(
    root: MdastRoot,
    url: string | URL
): Promise<Array<Result<[string, string]>>> {
    url = new URL(url);
    const imageUrls: Array<string> = [];

    visit(root, function (node) {
        let imageUrl: string | undefined = undefined;
        if (node.type === "image") {
            imageUrl = node.url;
        } else if (node.type === "mdxJsxFlowElement") {
            imageUrl = node.attributes.find(
                (attr) => attr.type === "mdxJsxAttribute" && (attr.name === "src" || attr.name === "img")
            )?.value as string | undefined;
        }

        if (!imageUrl) {
            return CONTINUE;
        }

        if (imageUrl.startsWith("/")) {
            imageUrl = new URL(imageUrl, url.origin).toString();
        }
        imageUrls.push(imageUrl);
        return CONTINUE;
    });

    const imageResults = await Promise.all(imageUrls.map(async (imageUrl) => await downloadImage(imageUrl)));

    const imagePathsMap = new Map<string, string>(
        imageResults.filter((result) => result.success).map((result) => result.data as [string, string])
    );

    visit(root, function (node, index, parent) {
        if (node.type === "image") {
            if (node.url.startsWith("/")) {
                node.url = imagePathsMap.get(new URL(node.url, url.origin).toString()) ?? node.url;
            } else {
                node.url = imagePathsMap.get(node.url) ?? node.url;
            }
            if (parent && typeof index === "number") {
                parent.children[index] = node;
            }
        } else if (node.type === "mdxJsxFlowElement") {
            const urlAttr = (node.attributes as Array<MdxJsxAttribute>).find(
                (attr) => attr.type === "mdxJsxAttribute" && (attr.name === "src" || attr.name === "img")
            );
            if (!urlAttr) {
                return CONTINUE;
            }

            urlAttr.value = imagePathsMap.get(urlAttr.value as string) ?? urlAttr.value;
            if (parent && typeof index === "number") {
                parent.children[index] = node;
            }
        }
        return CONTINUE;
    });

    return imageResults;
}
