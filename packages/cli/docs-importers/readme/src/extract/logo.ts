import type { Element, Root as HastRoot } from "hast";
import { visit } from "unist-util-visit";

import { downloadImage } from "../utils/files/images";
import { htmlToHast } from "../utils/hast";

function getLogoNodes(root: HastRoot): Array<Element> | undefined {
    const logoElements: Array<Element> = [];
    visit(root, "element", (element) => {
        const isLogoImage =
            element.tagName === "img" &&
            Array.isArray(element.properties.className) &&
            element.properties.className.includes("rm-Logo-img");

        if (isLogoImage) {
            logoElements.push(element);
        }
    });
    return logoElements.length > 0 ? logoElements : undefined;
}

export async function findLogosFromHtml(html: string, filepaths: Array<string>): Promise<void> {
    const hastTree = htmlToHast(html);
    const logoImages = getLogoNodes(hastTree);

    if (logoImages != null) {
        const downloadResults = await Promise.all(
            logoImages.map(async (image) => {
                const downloadResult = await downloadImage(image.properties.src as string);
                return downloadResult.success && downloadResult.data ? downloadResult.data[1] : "";
            })
        );
        filepaths.push(...downloadResults);
    }
    for (let i = filepaths.length - 1; i >= 0; i--) {
        if (!filepaths[i]) {
            filepaths.splice(i, 1);
        }
    }
}
