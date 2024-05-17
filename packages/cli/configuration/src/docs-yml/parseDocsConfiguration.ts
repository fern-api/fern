import { assertNever, isPlainObject } from "@fern-api/core-utils";
import { DocsV1Write } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, dirname, doesPathExist, resolve } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { WithoutQuestionMarks } from "../commons/WithoutQuestionMarks";
import { convertColorsConfiguration } from "./convertColorsConfiguration";
import { getAllPages } from "./getAllPages";
import {
    AbsoluteJsFileConfig,
    DocsNavigationConfiguration,
    DocsNavigationItem,
    FilepathOrUrl,
    FontConfig,
    JavascriptConfig,
    ParsedApiNavigationItem,
    ParsedDocsConfiguration,
    ParsedMetadataConfig,
    TabbedDocsNavigation,
    TypographyConfig,
    UntabbedDocsNavigation,
    VersionInfo
} from "./ParsedDocsConfiguration";
import { FernDocsConfig as RawDocs, NavigationConfig, Serializer, VersionConfig } from "./schemas";

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
        title,

        /* navigation */
        tabs,
        versions,
        navigation: rawNavigation,
        navbarLinks,
        footerLinks,

        /* seo */
        metadata: rawMetadata,
        redirects,

        /* branding */
        logo: rawLogo,
        favicon: faviconRef,
        backgroundImage: rawBackgroundImage,
        colors,
        typography: rawTypography,
        layout,

        /* integrations */
        integrations,

        /* scripts */
        css: rawCssConfig,
        js: rawJsConfig
    } = rawDocsConfiguration;

    const convertedNavigationPromise = getNavigationConfiguration({
        versions,
        navigation: rawNavigation,
        absolutePathToFernFolder,
        absolutePathToConfig: absoluteFilepathToDocsConfig,
        context
    });

    const pagesPromise = convertedNavigationPromise.then((convertedNavigation) =>
        getAllPages({ navigation: convertedNavigation, absolutePathToFernFolder })
    );

    const logo = convertLogoReference(rawLogo, absoluteFilepathToDocsConfig);

    const favicon = resolveFilepath(faviconRef, absoluteFilepathToDocsConfig);

    const backgroundImage = convertBackgroundImage(rawBackgroundImage, absoluteFilepathToDocsConfig);

    const typographyPromise =
        rawTypography != null
            ? convertTypographyConfiguration({
                  rawTypography,
                  absoluteFilepathToDocsConfig
              })
            : undefined;

    const cssPromise = convertCssConfig(rawCssConfig, absoluteFilepathToDocsConfig);
    const jsPromise = convertJsConfig(rawJsConfig, absoluteFilepathToDocsConfig);

    const metadataPromise = convertMetadata(rawMetadata, absoluteFilepathToDocsConfig);

    const [navigation, pages, typography, css, js, metadata] = await Promise.all([
        convertedNavigationPromise,
        pagesPromise,
        typographyPromise,
        cssPromise,
        jsPromise,
        metadataPromise
    ]);

    return {
        title,
        // absoluteFilepath: absoluteFilepathToDocsConfig,
        instances,

        /* filepath of page to contents */
        pages,

        /* navigation */
        tabs,
        navigation,
        navbarLinks: convertNavbarLinks(navbarLinks),
        footerLinks: convertFooterLinks(footerLinks),

        /* seo */
        metadata,
        redirects,

        /* branding */
        logo,
        favicon,
        backgroundImage,
        colors: convertColorsConfiguration(colors, context),
        typography,
        layout: convertLayoutConfig(layout),

        /* integrations */
        integrations,

        /* scripts */
        css,
        js
    };
}

function convertLogoReference(
    rawLogo: RawDocs.LogoConfiguration | undefined,
    absoluteFilepathToDocsConfig: AbsoluteFilePath
): ParsedDocsConfiguration["logo"] {
    return rawLogo != null
        ? {
              dark: resolveFilepath(rawLogo.dark, absoluteFilepathToDocsConfig),
              light: resolveFilepath(rawLogo.light, absoluteFilepathToDocsConfig),
              height: rawLogo.height,
              href: rawLogo.href != null ? rawLogo.href : undefined
          }
        : undefined;
}

function convertBackgroundImage(
    rawBackgroundImage: RawDocs.BackgroundImageConfiguration | undefined,
    absoluteFilepathToDocsConfig: AbsoluteFilePath
): ParsedDocsConfiguration["backgroundImage"] {
    if (rawBackgroundImage == null) {
        return undefined;
    } else if (typeof rawBackgroundImage === "string") {
        const image = resolveFilepath(rawBackgroundImage, absoluteFilepathToDocsConfig);

        return { dark: image, light: image };
    } else {
        const dark = resolveFilepath(rawBackgroundImage.dark, absoluteFilepathToDocsConfig);
        const light = resolveFilepath(rawBackgroundImage.light, absoluteFilepathToDocsConfig);

        return { dark, light };
    }
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
                const content = await readFile(resolveFilepath(cssFilePath, absoluteFilepathToDocsConfig));
                return content.toString();
            })
        )
    };
}

function isRemoteJsConfig(
    config: RawDocs.JsRemoteConfig | RawDocs.JsFileConfigSettings
): config is RawDocs.JsRemoteConfig {
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
                absolutePath: resolveFilepath(config, absoluteFilepathToDocsConfig)
            });
        } else if (isRemoteJsConfig(config)) {
            remote.push(config);
        } else if (isFileJsConfig(config)) {
            files.push({
                absolutePath: resolveFilepath(config.path, absoluteFilepathToDocsConfig),
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
                : DocsV1Write.SidebarOrHeaderPlacement.Sidebar,
        contentAlignment:
            layout.contentAlignment === "left"
                ? DocsV1Write.ContentAlignment.Left
                : DocsV1Write.ContentAlignment.Center,
        headerPosition:
            layout.headerPosition === "static" ? DocsV1Write.HeaderPosition.Absolute : DocsV1Write.HeaderPosition.Fixed,
        disableHeader: layout.disableHeader ?? false
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
            const result = await Serializer.VersionFileConfig.parseOrThrow(content);
            const navigation = await convertNavigationConfiguration({
                rawNavigationConfig: result.navigation,
                absolutePathToFernFolder,
                absolutePathToConfig: absoluteFilepathToVersionFile,
                context
            });
            versionedNavbars.push({
                tabs: result.tabs,
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
            absolutePath: resolveFilepath(rawVariant.path, absoluteFilepathToDocsConfig),
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
                if (item.layout == null) {
                    return { tab: item.tab };
                }
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
            absolutePath: resolveFilepath(rawConfig.path, absolutePathToConfig),
            slug: rawConfig.slug,
            icon: rawConfig.icon,
            hidden: rawConfig.hidden
        };
    }
    if (isRawSectionConfig(rawConfig)) {
        return {
            type: "section",
            title: rawConfig.section,
            icon: rawConfig.icon,
            contents: await Promise.all(
                rawConfig.contents.map((item) =>
                    convertNavigationItem({ rawConfig: item, absolutePathToFernFolder, absolutePathToConfig, context })
                )
            ),
            slug: rawConfig.slug ?? undefined,
            collapsed: rawConfig.collapsed ?? undefined,
            hidden: rawConfig.hidden ?? undefined,
            skipUrlSlug: rawConfig.skipSlug ?? false
        };
    }
    if (isRawApiSectionConfig(rawConfig)) {
        return {
            type: "apiSection",
            title: rawConfig.api,
            icon: rawConfig.icon,
            apiName: rawConfig.apiName ?? undefined,
            audiences:
                rawConfig.audiences != null ? { type: "select", audiences: rawConfig.audiences } : { type: "all" },
            showErrors: rawConfig.displayErrors ?? false,
            snippetsConfiguration:
                rawConfig.snippets != null
                    ? convertSnippetsConfiguration({ rawConfig: rawConfig.snippets })
                    : undefined,
            navigation: rawConfig.layout?.flatMap((item) => parseApiNavigationItem(item, absolutePathToConfig)) ?? [],
            summaryAbsolutePath: resolveFilepath(rawConfig.summary, absolutePathToConfig),
            hidden: rawConfig.hidden ?? undefined,
            slug: rawConfig.slug,
            skipUrlSlug: rawConfig.skipSlug ?? false,
            flattened: rawConfig.flattened ?? false
        };
    }
    if (isRawLinkConfig(rawConfig)) {
        return {
            type: "link",
            text: rawConfig.link,
            url: rawConfig.href
        };
    }
    assertNever(rawConfig);
}

function parseApiNavigationItem(
    item: RawDocs.ApiNavigationItem,
    absolutePathToConfig: AbsoluteFilePath
): ParsedApiNavigationItem[] {
    if (typeof item === "string") {
        return [{ type: "item", value: item }];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (isRawPageConfig(item)) {
        return [
            {
                type: "page",
                title: item.page,
                absolutePath: resolveFilepath(item.path, absolutePathToConfig),
                slug: item.slug,
                icon: item.icon,
                hidden: item.hidden
            }
        ];
    }

    return Object.entries(item).map(([key, values]): ParsedApiNavigationItem.Subpackage => {
        return {
            type: "subpackage",
            subpackageId: key,
            summaryAbsolutePath: undefined, // TODO: implement subpackage summary page
            items: values.flatMap((value) => parseApiNavigationItem(value, absolutePathToConfig))
        };
    });
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

function isRawPageConfig(item: unknown): item is RawDocs.PageConfiguration {
    return isPlainObject(item) && typeof item.page === "string" && typeof item.path === "string";
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
    return (item as RawDocs.LinkConfiguration).link != null;
}

export function resolveFilepath(unresolvedFilepath: string, absolutePath: AbsoluteFilePath): AbsoluteFilePath;
export function resolveFilepath(
    unresolvedFilepath: string | undefined,
    absolutePath: AbsoluteFilePath
): AbsoluteFilePath | undefined;
export function resolveFilepath(
    unresolvedFilepath: string | undefined,
    absoluteFilepathToDocsConfig: AbsoluteFilePath
): AbsoluteFilePath | undefined {
    if (unresolvedFilepath == null) {
        return undefined;
    }
    return resolve(dirname(absoluteFilepathToDocsConfig), unresolvedFilepath);
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

function convertNavbarLinks(navbarLinks: RawDocs.NavbarLink[] | undefined): DocsV1Write.NavbarLink[] | undefined {
    return navbarLinks?.map((navbarLink): DocsV1Write.NavbarLink => {
        if (navbarLink.type === "github") {
            return { type: "github", url: navbarLink.value };
        }

        return {
            type: navbarLink.type,
            text: navbarLink.text,
            url: navbarLink.href ?? navbarLink.url ?? "/",
            icon: navbarLink.icon,
            rightIcon: navbarLink.rightIcon,
            rounded: navbarLink.rounded
        };
    });
}

function convertFooterLinks(footerLinks: RawDocs.FooterLinksConfig | undefined): DocsV1Write.FooterLink[] | undefined {
    if (footerLinks == null) {
        return undefined;
    }

    const links: DocsV1Write.FooterLink[] = [];

    (Object.keys(footerLinks) as (keyof RawDocs.FooterLinksConfig)[]).forEach((key) => {
        const link = footerLinks[key];
        if (link == null) {
            return;
        }
        links.push({ type: key, value: link });
    });

    if (links.length === 0) {
        return undefined;
    }

    return links;
}

async function convertMetadata(
    metadata: RawDocs.MetadataConfig | undefined,
    absoluteFilepathToDocsConfig: AbsoluteFilePath
): Promise<ParsedMetadataConfig | undefined> {
    if (metadata == null) {
        return undefined;
    }

    return {
        "og:site_name": metadata.ogSiteName,
        "og:title": metadata.ogTitle,
        "og:description": metadata.ogDescription,
        "og:url": metadata.ogUrl,
        "og:image": await convertFilepathOrUrl(metadata.ogImage, absoluteFilepathToDocsConfig),
        "og:image:width": metadata.ogImageWidth,
        "og:image:height": metadata.ogImageHeight,
        "og:locale": metadata.ogLocale,
        "og:logo": await convertFilepathOrUrl(metadata.ogLogo, absoluteFilepathToDocsConfig),
        "twitter:title": metadata.twitterTitle,
        "twitter:description": metadata.twitterDescription,
        "twitter:image": await convertFilepathOrUrl(metadata.twitterImage, absoluteFilepathToDocsConfig),
        "twitter:handle": metadata.twitterHandle,
        "twitter:site": metadata.twitterSite,
        "twitter:url": metadata.twitterUrl,
        "twitter:card": metadata.twitterCard
    };
}

async function convertFilepathOrUrl(
    value: string | undefined,
    absoluteFilepathToDocsConfig: AbsoluteFilePath
): Promise<FilepathOrUrl | undefined> {
    if (value == null) {
        return undefined;
    }

    if (value.startsWith("http")) {
        return { type: "url", value };
    }

    const filepath = resolveFilepath(value, absoluteFilepathToDocsConfig);

    if (await doesPathExist(filepath)) {
        return { type: "filepath", value: filepath };
    }

    // If the file does not exist, fallback to a URL
    return { type: "url", value };
}
