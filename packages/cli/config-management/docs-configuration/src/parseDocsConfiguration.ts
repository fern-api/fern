import { assertNever } from "@fern-api/core-utils";
import { DocsV1Write } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, dirname, resolve } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { FernDocsConfig as RawDocs } from "@fern-fern/docs-config";
import { NavigationConfig, VersionConfig } from "@fern-fern/docs-config/api";
import { VersionFileConfig as RawVersionFileConfigSerializer } from "@fern-fern/docs-config/serialization";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { convertColorsConfiguration } from "./convertColorsConfiguration";
import { getAllPages } from "./getAllPages";
import {
    AbsoluteJsFileConfig,
    DocsNavigationConfiguration,
    DocsNavigationItem,
    FontConfig,
    ImageReference,
    JavascriptConfig,
    ParsedDocsConfiguration,
    TabbedDocsNavigation,
    TypographyConfig,
    UntabbedDocsNavigation,
    VersionInfo,
    WithoutQuestionMarks
} from "./ParsedDocsConfiguration";

export async function parseDocsConfiguration({
    rawDocsConfiguration,
    absolutePathToFernFolder,
    absoluteFilepathToDocsConfig,
    context
}: {
    rawDocsConfiguration: RawDocs.DocsConfiguration;
    absolutePathToFernFolder: AbsoluteFilePath;
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
    context: TaskContext;
}): Promise<WithoutQuestionMarks<ParsedDocsConfiguration>> {
    const {
        instances,
        navigation,
        colors,
        favicon: faviconRef,
        backgroundImage: backgroundImageRef,
        logo: rawLogo,
        navbarLinks,
        title,
        typography: rawTypography,
        tabs,
        versions,
        layout,
        css: rawCssConfig,
        js: rawJsConfig
    } = rawDocsConfiguration;

    const convertedNavigationPromise = getNavigationConfiguration({
        versions,
        navigation,
        absolutePathToFernFolder,
        absolutePathToConfig: absoluteFilepathToDocsConfig,
        context
    });

    const pagesPromise = convertedNavigationPromise.then((convertedNavigation) =>
        getAllPages({ navigation: convertedNavigation, absolutePathToFernFolder })
    );

    const logo =
        rawLogo != null
            ? {
                  dark:
                      rawLogo.dark != null
                          ? await convertImageReference({
                                rawImageReference: rawLogo.dark,
                                absoluteFilepathToDocsConfig
                            })
                          : undefined,
                  light:
                      rawLogo.light != null
                          ? await convertImageReference({
                                rawImageReference: rawLogo.light,
                                absoluteFilepathToDocsConfig
                            })
                          : undefined,
                  height: rawLogo.height,
                  href: rawLogo.href != null ? rawLogo.href : undefined
              }
            : undefined;

    const faviconPromise =
        faviconRef != null
            ? convertImageReference({ rawImageReference: faviconRef, absoluteFilepathToDocsConfig })
            : undefined;

    const backgroundImagePromise =
        backgroundImageRef != null
            ? convertImageReference({
                  rawImageReference: backgroundImageRef,
                  absoluteFilepathToDocsConfig
              })
            : undefined;

    const typographyPromise =
        rawTypography != null
            ? convertTypographyConfiguration({
                  rawTypography,
                  absoluteFilepathToDocsConfig
              })
            : undefined;

    const cssPromise = convertCssConfig(rawCssConfig, absoluteFilepathToDocsConfig);
    const jsPromise = convertJsConfig(rawJsConfig, absoluteFilepathToDocsConfig);

    const [convertedNavigation, pages, favicon, backgroundImage, typography, css, js] = await Promise.all([
        convertedNavigationPromise,
        pagesPromise,
        faviconPromise,
        backgroundImagePromise,
        typographyPromise,
        cssPromise,
        jsPromise
    ]);

    return {
        instances,
        absoluteFilepath: absoluteFilepathToDocsConfig,
        pages,
        navigation: convertedNavigation,
        title,
        tabs,
        logo,
        favicon,
        backgroundImage,
        colors: convertColorsConfiguration(colors ?? {}, context),
        navbarLinks,
        typography,
        layout: convertLayoutConfig(layout),
        css,
        js
    };
}

async function convertCssConfig(
    css: RawDocs.CssConfig | undefined,
    absoluteFilepathToDocsConfig: AbsoluteFilePath
): Promise<ParsedDocsConfiguration["css"]> {
    if (css == null) {
        return undefined;
    }
    const cssFilePaths = typeof css === "string" ? [css] : css;
    return {
        inline: await Promise.all(
            cssFilePaths.map(async (cssFilePath) => {
                const content = await readFile(
                    await resolveFilepath({
                        rawUnresolvedFilepath: cssFilePath,
                        absolutePath: absoluteFilepathToDocsConfig
                    })
                );
                return content.toString();
            })
        )
    };
}

function isRemoteJsConfig(
    config: RawDocs.JsRemoteConfig | RawDocs.JsFileConfigSettings
): config is DocsV1Write.JsRemoteConfig {
    return Object.hasOwn(config, "url");
}

function isFileJsConfig(
    config: RawDocs.JsRemoteConfig | RawDocs.JsFileConfigSettings
): config is RawDocs.JsFileConfigSettings {
    return Object.hasOwn(config, "path");
}

async function convertJsConfig(
    js: RawDocs.JsConfig | undefined,
    absoluteFilepathToDocsConfig: AbsoluteFilePath
): Promise<JavascriptConfig> {
    const remote: DocsV1Write.JsRemoteConfig[] = [];
    const files: AbsoluteJsFileConfig[] = [];
    if (js == null) {
        return { files: [] };
    }

    const configs = Array.isArray(js) ? js : [js];

    for (const config of configs) {
        if (typeof config === "string") {
            files.push({
                absolutePath: await resolveFilepath({
                    rawUnresolvedFilepath: config,
                    absolutePath: absoluteFilepathToDocsConfig
                })
            });
        } else if (isRemoteJsConfig(config)) {
            remote.push(config);
        } else if (isFileJsConfig(config)) {
            files.push({
                absolutePath: await resolveFilepath({
                    rawUnresolvedFilepath: config.path,
                    absolutePath: absoluteFilepathToDocsConfig
                }),
                strategy: config.strategy
            });
        }
    }

    return { remote, files };
}

function convertLayoutConfig(layout: RawDocs.LayoutConfig | undefined): ParsedDocsConfiguration["layout"] {
    if (layout == null) {
        return undefined;
    }

    return {
        pageWidth:
            layout.pageWidth?.trim().toLowerCase() === "full" ? { type: "full" } : parseSizeConfig(layout.pageWidth),
        contentWidth: parseSizeConfig(layout.contentWidth),
        sidebarWidth: parseSizeConfig(layout.sidebarWidth),
        headerHeight: parseSizeConfig(layout.headerHeight),

        searchbarPlacement:
            layout.searchbarPlacement === "header"
                ? DocsV1Write.SidebarOrHeaderPlacement.Header
                : DocsV1Write.SidebarOrHeaderPlacement.Sidebar,
        tabsPlacement:
            layout.tabsPlacement === "header"
                ? DocsV1Write.SidebarOrHeaderPlacement.Header
                : DocsV1Write.SidebarOrHeaderPlacement.Sidebar
    };
}

function parseSizeConfig(sizeAsString: string | undefined): DocsV1Write.SizeConfig | undefined {
    if (sizeAsString == null) {
        return undefined;
    }

    const sizeAsStringClean = sizeAsString.trim().toLowerCase();

    const pxMatch = sizeAsStringClean.match(/^(\d+)px$/);
    if (pxMatch != null && pxMatch[1] != null) {
        return {
            type: "px",
            value: parseFloat(pxMatch[1])
        };
    }

    const remMatch = sizeAsStringClean.match(/^(\d+)rem$/);
    if (remMatch != null && remMatch[1] != null) {
        return {
            type: "rem",
            value: parseFloat(remMatch[1])
        };
    }

    return undefined;
}

async function getNavigationConfiguration({
    versions,
    navigation,
    absolutePathToFernFolder,
    absolutePathToConfig,
    context
}: {
    versions?: VersionConfig[];
    navigation?: NavigationConfig;
    absolutePathToFernFolder: AbsoluteFilePath;
    absolutePathToConfig: AbsoluteFilePath;
    context: TaskContext;
}): Promise<DocsNavigationConfiguration> {
    if (navigation != null) {
        return await convertNavigationConfiguration({
            rawNavigationConfig: navigation,
            absolutePathToFernFolder,
            absolutePathToConfig,
            context
        });
    } else if (versions != null) {
        const versionedNavbars: VersionInfo[] = [];
        for (const version of versions) {
            const absoluteFilepathToVersionFile = resolve(absolutePathToFernFolder, version.path);
            const content = yaml.load((await readFile(absoluteFilepathToVersionFile)).toString());
            const result = await RawVersionFileConfigSerializer.parseOrThrow(content);
            const navigation = await convertNavigationConfiguration({
                rawNavigationConfig: result.navigation,
                absolutePathToFernFolder,
                absolutePathToConfig: absoluteFilepathToVersionFile,
                context
            });
            versionedNavbars.push({
                version: version.displayName,
                navigation,
                availability: version.availability,
                slug: version.slug
            });
        }
        return {
            type: "versioned",
            versions: versionedNavbars
        };
    }
    throw new Error("Unexpected. Docs have neither navigation or versions defined.");
}

async function convertTypographyConfiguration({
    rawTypography,
    absoluteFilepathToDocsConfig
}: {
    rawTypography: RawDocs.DocsTypographyConfig;
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
}): Promise<TypographyConfig> {
    return {
        headingsFont:
            rawTypography.headingsFont != null
                ? await convertFontConfig({
                      rawFontConfig: rawTypography.headingsFont,
                      absoluteFilepathToDocsConfig
                  })
                : undefined,
        bodyFont:
            rawTypography.bodyFont != null
                ? await convertFontConfig({
                      rawFontConfig: rawTypography.bodyFont,
                      absoluteFilepathToDocsConfig
                  })
                : undefined,
        codeFont:
            rawTypography.codeFont != null
                ? await convertFontConfig({
                      rawFontConfig: rawTypography.codeFont,
                      absoluteFilepathToDocsConfig
                  })
                : undefined
    };
}

async function convertFontConfig({
    rawFontConfig,
    absoluteFilepathToDocsConfig
}: {
    rawFontConfig: RawDocs.FontConfig;
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
}): Promise<FontConfig> {
    return {
        name: rawFontConfig.name,
        variants: await constructVariants(rawFontConfig, absoluteFilepathToDocsConfig),
        display: rawFontConfig.display,
        fallback: rawFontConfig.fallback,
        fontVariationSettings: rawFontConfig.fontVariationSettings
    };
}

function constructVariants(
    rawFontConfig: RawDocs.FontConfig,
    absoluteFilepathToDocsConfig: AbsoluteFilePath
): Promise<FontConfig["variants"]> {
    const variants: RawDocs.FontConfigVariant[] = [];

    if (rawFontConfig.path != null) {
        variants.push({
            path: rawFontConfig.path,
            weight: rawFontConfig.weight,
            style: rawFontConfig.style
        });
    }

    rawFontConfig.paths?.forEach((rawVariant) => {
        if (typeof rawVariant === "string") {
            variants.push({
                path: rawVariant,
                weight: rawFontConfig.weight,
                style: rawFontConfig.style
            });
        } else {
            variants.push({
                path: rawVariant.path,
                weight: rawVariant.weight ?? rawFontConfig.weight,
                style: rawVariant.style ?? rawFontConfig.style
            });
        }
    });

    return Promise.all(
        variants.map(async (rawVariant) => ({
            absolutePath: await resolveFilepath({
                absolutePath: absoluteFilepathToDocsConfig,
                rawUnresolvedFilepath: rawVariant.path
            }),
            weight: parseWeight(rawVariant.weight),
            style: rawVariant.style
        }))
    );
}

function parseWeight(weight: string | undefined): string[] | undefined {
    if (weight == null) {
        return undefined;
    }

    const weights = weight
        .split(/\D+/)
        .filter(
            (item) => item !== "" && ["100", "200", "300", "400", "500", "600", "700", "800", "900"].includes(item)
        );

    return weights;
}

async function convertNavigationConfiguration({
    rawNavigationConfig,
    absolutePathToFernFolder,
    absolutePathToConfig,
    context
}: {
    rawNavigationConfig: RawDocs.NavigationConfig;
    absolutePathToFernFolder: AbsoluteFilePath;
    absolutePathToConfig: AbsoluteFilePath;
    context: TaskContext;
}): Promise<UntabbedDocsNavigation | TabbedDocsNavigation> {
    if (isTabbedNavigationConfig(rawNavigationConfig)) {
        const tabbedNavigationItems = await Promise.all(
            rawNavigationConfig.map(async (item) => {
                const layout = await Promise.all(
                    item.layout.map((item) =>
                        convertNavigationItem({
                            rawConfig: item,
                            absolutePathToFernFolder,
                            absolutePathToConfig,
                            context
                        })
                    )
                );
                return {
                    tab: item.tab,
                    layout
                };
            })
        );
        return {
            type: "tabbed",
            items: tabbedNavigationItems
        };
    } else {
        return {
            type: "untabbed",
            items: await Promise.all(
                rawNavigationConfig.map((item) =>
                    convertNavigationItem({ rawConfig: item, absolutePathToFernFolder, absolutePathToConfig, context })
                )
            )
        };
    }
}

async function convertNavigationItem({
    rawConfig,
    absolutePathToFernFolder,
    absolutePathToConfig,
    context
}: {
    rawConfig: RawDocs.NavigationItem;
    absolutePathToFernFolder: AbsoluteFilePath;
    absolutePathToConfig: AbsoluteFilePath;
    context: TaskContext;
}): Promise<DocsNavigationItem> {
    if (isRawPageConfig(rawConfig)) {
        return {
            type: "page",
            title: rawConfig.page,
            absolutePath: await resolveFilepath({
                absolutePath: absolutePathToConfig,
                rawUnresolvedFilepath: rawConfig.path
            }),
            slug: rawConfig.slug ?? undefined
        };
    }
    if (isRawSectionConfig(rawConfig)) {
        return {
            type: "section",
            title: rawConfig.section,
            contents: await Promise.all(
                rawConfig.contents.map((item) =>
                    convertNavigationItem({ rawConfig: item, absolutePathToFernFolder, absolutePathToConfig, context })
                )
            ),
            slug: rawConfig.slug ?? undefined,
            collapsed: rawConfig.collapsed ?? undefined
        };
    }
    if (isRawApiSectionConfig(rawConfig)) {
        return {
            type: "apiSection",
            title: rawConfig.api,
            apiName: rawConfig.apiName ?? undefined,
            audiences:
                rawConfig.audiences != null ? { type: "select", audiences: rawConfig.audiences } : { type: "all" },
            showErrors: rawConfig.displayErrors ?? false,
            snippetsConfiguration:
                rawConfig.snippets != null ? convertSnippetsConfiguration({ rawConfig: rawConfig.snippets }) : undefined
        };
    }
    if (isRawLinkConfig(rawConfig)) {
        return {
            type: "link",
            text: rawConfig.text,
            url: rawConfig.url
        };
    }
    assertNever(rawConfig);
}

function convertSnippetsConfiguration({
    rawConfig
}: {
    rawConfig: RawDocs.SnippetsConfiguration;
}): DocsNavigationItem.SnippetsConfiguration {
    return {
        python: rawConfig.python,
        typescript: rawConfig.typescript,
        go: rawConfig.go,
        java: rawConfig.java
    };
}

function isRawPageConfig(item: RawDocs.NavigationItem): item is RawDocs.PageConfiguration {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (item as RawDocs.PageConfiguration).page != null;
}

function isRawSectionConfig(item: RawDocs.NavigationItem): item is RawDocs.SectionConfiguration {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (item as RawDocs.SectionConfiguration).section != null;
}

function isRawApiSectionConfig(item: RawDocs.NavigationItem): item is RawDocs.ApiSectionConfiguration {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (item as RawDocs.ApiSectionConfiguration).api != null;
}

function isRawLinkConfig(item: RawDocs.NavigationItem): item is RawDocs.LinkConfiguration {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (item as RawDocs.LinkConfiguration).url != null;
}

async function convertImageReference({
    rawImageReference,
    absoluteFilepathToDocsConfig
}: {
    rawImageReference: string;
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
}): Promise<ImageReference> {
    return {
        filepath: await resolveFilepath({
            absolutePath: absoluteFilepathToDocsConfig,
            rawUnresolvedFilepath: rawImageReference
        })
    };
}

async function resolveFilepath({
    rawUnresolvedFilepath,
    absolutePath
}: {
    rawUnresolvedFilepath: string;
    absolutePath: AbsoluteFilePath;
}): Promise<AbsoluteFilePath> {
    const resolved = resolve(dirname(absolutePath), rawUnresolvedFilepath);
    return resolved;
}

function isTabbedNavigationConfig(
    navigationConfig: RawDocs.NavigationConfig
): navigationConfig is RawDocs.TabbedNavigationConfig {
    return (
        Array.isArray(navigationConfig) &&
        navigationConfig.length > 0 &&
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (navigationConfig[0] as RawDocs.TabbedNavigationItem).tab != null
    );
}
