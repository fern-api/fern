import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";

export function loadDocsBackgroundImage(docsDefinition: FernRegistryDocsRead.DocsDefinition): string | undefined {
    const backgroundImage = docsDefinition.config.backgroundImage;
    if (backgroundImage == null) {
        return undefined;
    }

    const backgroundImageUrl = docsDefinition.files[backgroundImage];

    if (backgroundImageUrl == null) {
        throw new Error(`Could not resolve background image file for type ${backgroundImageUrl}.`);
    }

    const stylesheet = `
      :root {
        --docs-background-image: url(${backgroundImageUrl});
      }
    `;

    return stylesheet;
}
