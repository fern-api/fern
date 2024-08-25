import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";

export function collectFilesFromDocsConfig(parsedDocsConfig: docsYml.ParsedDocsConfiguration): Set<AbsoluteFilePath> {
    const filepaths = new Set<AbsoluteFilePath>();

    /* branding images */
    if (parsedDocsConfig.logo?.dark != null) {
        filepaths.add(parsedDocsConfig.logo.dark);
    }

    if (parsedDocsConfig.logo?.light != null) {
        filepaths.add(parsedDocsConfig.logo.light);
    }

    if (parsedDocsConfig.favicon != null) {
        filepaths.add(parsedDocsConfig.favicon);
    }

    if (parsedDocsConfig.backgroundImage?.dark != null) {
        filepaths.add(parsedDocsConfig.backgroundImage.dark);
    }

    if (parsedDocsConfig.backgroundImage?.light != null) {
        filepaths.add(parsedDocsConfig.backgroundImage.light);
    }

    /* opengraph images */
    if (parsedDocsConfig.metadata?.["og:image"] != null && parsedDocsConfig.metadata["og:image"].type === "filepath") {
        filepaths.add(parsedDocsConfig.metadata["og:image"].value);
    }

    if (parsedDocsConfig.metadata?.["og:logo"] != null && parsedDocsConfig.metadata["og:logo"].type === "filepath") {
        filepaths.add(parsedDocsConfig.metadata["og:logo"].value);
    }

    if (
        parsedDocsConfig.metadata?.["twitter:image"] != null &&
        parsedDocsConfig.metadata["twitter:image"].type === "filepath"
    ) {
        filepaths.add(parsedDocsConfig.metadata["twitter:image"].value);
    }

    /* typography */
    if (parsedDocsConfig.typography?.bodyFont != null) {
        parsedDocsConfig.typography.bodyFont.variants.forEach((variant) => {
            filepaths.add(variant.absolutePath);
        });
    }

    if (parsedDocsConfig.typography?.headingsFont != null) {
        parsedDocsConfig.typography.headingsFont.variants.forEach((variant) => {
            filepaths.add(variant.absolutePath);
        });
    }

    if (parsedDocsConfig.typography?.codeFont != null) {
        parsedDocsConfig.typography.codeFont.variants.forEach((variant) => {
            filepaths.add(variant.absolutePath);
        });
    }

    /* javascript files */
    if (parsedDocsConfig.js != null) {
        parsedDocsConfig.js.files.forEach((file) => {
            filepaths.add(file.absolutePath);
        });
    }

    return filepaths;
}
