import type { Root as MdastRoot } from "mdast";
import type { MdxJsxAttribute } from "mdast-util-mdx-jsx";
import { CONTINUE, visit } from "unist-util-visit";

export declare namespace getImagesUsedInFile {
    interface Output {
        imageURLs: string[];
        imageURLToFilename: Record<string, string>;
    }
}

export async function getImagesUsedInFile(root: MdastRoot, url: string | URL): Promise<getImagesUsedInFile.Output> {
    url = new URL(url);
    const imageURLs: string[] = [];
    const imageURLToFilename: Record<string, string> = {};

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
        imageURLs.push(imageUrl);
        return CONTINUE;
    });

    // Generate unique filenames for each image URL
    for (const imageUrl of imageURLs) {
        try {
            // Extract the filename from the URL
            const urlObj = new URL(imageUrl);
            const pathname = urlObj.pathname;

            // Get the filename from the path
            let filename = pathname.split("/").pop() || "";

            // Clean the filename and ensure it has an extension
            if (!filename.includes(".")) {
                // If no extension, default to .png
                filename = `${filename}.png`;
            }
            // Store the mapping from URL to filename
            imageURLToFilename[imageUrl] = filename;
        } catch (error) {
            // If URL parsing fails, use a fallback naming scheme
            const uniqueId = Math.random().toString(36).substring(2, 10);
            imageURLToFilename[imageUrl] = `image-${uniqueId}.png`;
        }
    }

    visit(root, function (node, index, parent) {
        if (node.type === "image") {
            if (node.url.startsWith("/")) {
                node.url = imageURLToFilename[new URL(node.url, url.origin).toString()] ?? node.url;
            } else {
                node.url = imageURLToFilename[node.url] ?? node.url;
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

            urlAttr.value = imageURLToFilename[urlAttr.value as string] ?? urlAttr.value;
            if (parent && typeof index === "number") {
                parent.children[index] = node;
            }
        }
        return CONTINUE;
    });

    return { imageURLs, imageURLToFilename };
}
