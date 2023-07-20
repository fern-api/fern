import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";

function getFontExtension(url: URL): string {
    const ext = url.pathname.split(".").pop();
    if (ext == null) {
        throw new Error("No extension found for font: " + url.pathname);
    }
    return ext;
}

export type FontType = "headingsFont" | "bodyFont" | "codeFont";

export interface GenerationFontConfig {
    fontType: FontType;
    fontName: string;
    fontExtension: string;
    fontUrl: FernRegistryDocsRead.Url;
}

export interface GenerationFontConfigs {
    headingsFont: GenerationFontConfig | undefined;
    bodyFont: GenerationFontConfig | undefined;
    codeFont: GenerationFontConfig | undefined;
}

export function getFontConfig(
    docsDefinition: FernRegistryDocsRead.DocsDefinition,
    fontType: FontType
): GenerationFontConfig | undefined {
    const typographyFontType = docsDefinition.config.typography?.[fontType];
    if (typographyFontType == null) {
        return undefined;
    }
    const fontName = typographyFontType.name;
    const fontUrl = docsDefinition.files[typographyFontType.fontFile];
    if (fontUrl == null) {
        throw new Error(`Could not resolve font file for type ${fontType}.`);
    }
    const fontExtension = getFontExtension(new URL(fontUrl));

    const fontConfig: GenerationFontConfig = {
        fontType,
        fontName,
        fontExtension,
        fontUrl,
    };

    return fontConfig;
}

export function loadDocTypography(docsDefinition: FernRegistryDocsRead.DocsDefinition): GenerationFontConfigs {
    const generationConfiguration: Record<keyof GenerationFontConfigs, GenerationFontConfig | undefined> = {
        headingsFont: undefined,
        bodyFont: undefined,
        codeFont: undefined,
    };

    const headingsFontConfig = getFontConfig(docsDefinition, "headingsFont");
    if (headingsFontConfig != null) {
        generationConfiguration.headingsFont = headingsFontConfig;
    }

    const bodyFontConfig = getFontConfig(docsDefinition, "bodyFont");
    if (bodyFontConfig != null) {
        generationConfiguration.bodyFont = bodyFontConfig;
    }

    const codeFontConfig = getFontConfig(docsDefinition, "codeFont");
    if (codeFontConfig != null) {
        generationConfiguration.codeFont = codeFontConfig;
    }

    return generationConfiguration;
}

export function generateFontFaces(generationConfiguration: GenerationFontConfigs): string {
    const fontFaces: string[] = [];

    for (const fontType in generationConfiguration) {
        const fontConfig = generationConfiguration[fontType as keyof GenerationFontConfigs];
        if (fontConfig != null) {
            if (fontConfig.fontType === "headingsFont") {
                const fontFace = `
                @font-face {
                    font-family: '${fontConfig.fontName}';
                    src: url('${fontConfig.fontUrl.toString()}') format('${fontConfig.fontExtension}');
                    font-weight: 700;
                    font-style: normal;
                }
    
                h1, h2, h3, h4, h5, h6 {
                    font-family: '${fontConfig.fontName}', sans-serif;
                }
    
                :root {
                  --typography-heading-font-family: '${fontConfig.fontName}', sans-serif;
                }
    
                .typography-font-heading {
                  font-family: var(--typography-heading-font-family);
                }
              `;
                fontFaces.push(fontFace);
            }

            if (fontConfig.fontType === "bodyFont") {
                const fontFace = `
                @font-face {
                    font-family: '${fontConfig.fontName}';
                    src: url('${fontConfig.fontUrl.toString()}') format('${fontConfig.fontExtension}');
                    font-weight: 400;
                    font-style: normal;
                }
    
                :root {
                  --typography-body-font-family: '${fontConfig.fontName}', sans-serif;
                }
    
                .typography-font-body {
                  font-family: var(--typography-body-font-family);
                }
              `;
                fontFaces.push(fontFace);
            }

            if (fontConfig.fontType === "codeFont") {
                const fontFace = `
                @font-face {
                    font-family: '${fontConfig.fontName}';
                    src: url('${fontConfig.fontUrl.toString()}') format('${fontConfig.fontExtension}');
                    font-weight: 400;
                    font-style: normal;
                }
    
                code, pre {
                    font-family: '${fontConfig.fontName}', monospace;
                }
    
                :root {
                  --typography-code-font-family: '${fontConfig.fontName}', sans-serif;
                }
    
                .typography-font-code {
                  font-family: var(--typography-code-font-family), Monospace;
                }
              `;
                fontFaces.push(fontFace);
            }
        }
    }

    return fontFaces.join("\n");
}
