import { docsYml } from "@fern-api/configuration";
import { assertNever, isPlainObject } from "@fern-api/core-utils";
import { AbsoluteFilePath, dirname, doesPathExist, listFiles, resolve } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { FernRegistry as CjsFdrSdk } from "@fern-fern/fdr-cjs-sdk";
import { readFile } from "fs/promises";
import yaml from "js-yaml";

import { WithoutQuestionMarks } from "../commons/WithoutQuestionMarks";
import { convertColorsConfiguration } from "./convertColorsConfiguration";
import { getAllPages, loadAllPages } from "./getAllPages";

export async function parseDocsConfiguration({
    rawDocsConfiguration,
    absolutePathToFernFolder,
    absoluteFilepathToDocsConfig,
    context
}: {
    rawDocsConfiguration: docsYml.RawSchemas.DocsConfiguration;
    absolutePathToFernFolder: AbsoluteFilePath;
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
    context: TaskContext;
}): Promise<WithoutQuestionMarks<docsYml.ParsedDocsConfiguration>> {
    const {
        instances,
        title,

        /* navigation */
        tabs,
        products,
        versions,
        navigation: rawNavigation,
        navbarLinks,
        footerLinks,
        defaultLanguage,

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
        js: rawJsConfig,

        aiChat,
        aiSearch,

        pageActions,

        experimental
    } = rawDocsConfiguration;

    const landingPage = parsePageConfig(rawDocsConfiguration.landingPage, absoluteFilepathToDocsConfig);

    const convertedNavigationPromise = getNavigationConfiguration({
        tabs,
        products,
        versions,
        navigation: rawNavigation,
        absolutePathToFernFolder,
        absolutePathToConfig: absoluteFilepathToDocsConfig,
        context
    });

    const pagesPromise = convertedNavigationPromise.then((convertedNavigation) =>
        loadAllPages({
            files: getAllPages({ navigation: convertedNavigation, landingPage }),
            absolutePathToFernFolder
        })
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
        roles: rawDocsConfiguration.roles,

        /* filepath of page to contents */
        pages,

        /* navigation */
        landingPage,
        navigation,
        navbarLinks: convertNavbarLinks(navbarLinks),
        footerLinks: convertFooterLinks(footerLinks),
        defaultLanguage,
        announcement: rawDocsConfiguration.announcement,

        /* seo */
        metadata,
        redirects: redirects?.map((redirect) => ({
            ...redirect,
            permanent: redirect?.permanent
        })),

        /* branding */
        logo,
        favicon,
        backgroundImage,
        colors: convertColorsConfiguration(colors, context),
        typography,
        layout: convertLayoutConfig(layout),
        settings: convertSettingsConfig(rawDocsConfiguration.settings),
        analyticsConfig: {
            ...rawDocsConfiguration.analytics,
            intercom: rawDocsConfiguration.analytics?.intercom
                ? {
                      ...rawDocsConfiguration.analytics.intercom,
                      appId: rawDocsConfiguration.analytics.intercom.appId,
                      apiBase: rawDocsConfiguration.analytics.intercom.apiBase
                  }
                : undefined,
            fullstory: rawDocsConfiguration.analytics?.fullstory,
            posthog: rawDocsConfiguration.analytics?.posthog
                ? {
                      ...rawDocsConfiguration.analytics.posthog,
                      apiKey: rawDocsConfiguration.analytics.posthog.apiKey,
                      endpoint: rawDocsConfiguration.analytics.posthog.endpoint
                  }
                : undefined,
            segment: rawDocsConfiguration.analytics?.segment,
            gtm: rawDocsConfiguration.analytics?.gtm,
            ga4: rawDocsConfiguration.analytics?.ga4,
            amplitude: undefined,
            mixpanel: undefined,
            hotjar: undefined,
            koala: undefined,
            logrocket: undefined,
            pirsch: undefined,
            plausible: undefined,
            fathom: undefined,
            clearbit: undefined,
            heap: undefined
        },

        /* integrations */
        integrations: {
            ...integrations,
            intercom: integrations?.intercom ? integrations.intercom : undefined
        },

        /* scripts */
        css,
        js,

        aiChatConfig: aiSearch ?? aiChat,

        pageActions: convertPageActions(pageActions),

        experimental
    };
}

function convertLogoReference(
    rawLogo: docsYml.RawSchemas.LogoConfiguration | undefined,
    absoluteFilepathToDocsConfig: AbsoluteFilePath
): docsYml.ParsedDocsConfiguration["logo"] {
    return rawLogo != null
        ? {
              dark: resolveFilepath(rawLogo.dark, absoluteFilepathToDocsConfig),
              light: resolveFilepath(rawLogo.light, absoluteFilepathToDocsConfig),
              height: rawLogo.height,
              href: rawLogo.href != null ? CjsFdrSdk.Url(rawLogo.href) : undefined
          }
        : undefined;
}

function convertBackgroundImage(
    rawBackgroundImage: docsYml.RawSchemas.BackgroundImageConfiguration | undefined,
    absoluteFilepathToDocsConfig: AbsoluteFilePath
): docsYml.ParsedDocsConfiguration["backgroundImage"] {
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
    css: docsYml.RawSchemas.CssConfig | undefined,
    absoluteFilepathToDocsConfig: AbsoluteFilePath
): Promise<docsYml.ParsedDocsConfiguration["css"]> {
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
    config: docsYml.RawSchemas.JsRemoteConfig | docsYml.RawSchemas.JsFileConfigSettings
): config is docsYml.RawSchemas.JsRemoteConfig {
    return Object.hasOwn(config, "url");
}

function isFileJsConfig(
    config: docsYml.RawSchemas.JsRemoteConfig | docsYml.RawSchemas.JsFileConfigSettings
): config is docsYml.RawSchemas.JsFileConfigSettings {
    return Object.hasOwn(config, "path");
}

async function convertJsConfig(
    js: docsYml.RawSchemas.JsConfig | undefined,
    absoluteFilepathToDocsConfig: AbsoluteFilePath
): Promise<docsYml.JavascriptConfig> {
    const remote: CjsFdrSdk.docs.v1.commons.JsRemoteConfig[] = [];
    const files: docsYml.AbsoluteJsFileConfig[] = [];
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
            remote.push({
                strategy: config.strategy,
                url: CjsFdrSdk.Url(config.url)
            });
        } else if (isFileJsConfig(config)) {
            files.push({
                absolutePath: resolveFilepath(config.path, absoluteFilepathToDocsConfig),
                strategy: config.strategy
            });
        }
    }

    return { remote, files };
}

function convertPageActions(
    pageActions: docsYml.RawSchemas.PageActionsConfig | undefined
): docsYml.ParsedDocsConfiguration["pageActions"] {
    if (pageActions == null) {
        return undefined;
    }

    const convertedDefault = pageActions.default != null ? convertPageActionOption(pageActions.default) : undefined;

    return {
        default: convertedDefault,
        options: {
            askAi: pageActions.options?.askAi ?? true,
            copyPage: pageActions.options?.copyPage ?? true,
            viewAsMarkdown: pageActions.options?.viewAsMarkdown ?? true,
            openAi: pageActions.options?.chatgpt ?? false,
            claude: pageActions.options?.claude ?? false,
            cursor: pageActions.options?.cursor ?? false,
            vscode: pageActions.options?.vscode ?? false
        }
    };
}

function convertPageActionOption(
    option: docsYml.RawSchemas.PageActionOption
): CjsFdrSdk.docs.v1.commons.PageActionOption {
    switch (option) {
        case "copy-page":
            return CjsFdrSdk.docs.v1.commons.PageActionOption.CopyPage;
        case "view-as-markdown":
            return CjsFdrSdk.docs.v1.commons.PageActionOption.ViewAsMarkdown;
        case "ask-ai":
            return CjsFdrSdk.docs.v1.commons.PageActionOption.AskAi;
        case "chatgpt":
            return CjsFdrSdk.docs.v1.commons.PageActionOption.OpenAi;
        case "claude":
            return CjsFdrSdk.docs.v1.commons.PageActionOption.Claude;
        case "cursor":
            return CjsFdrSdk.docs.v1.commons.PageActionOption.Cursor;
        case "vscode":
            return CjsFdrSdk.docs.v1.commons.PageActionOption.Vscode;
        default:
            assertNever(option);
    }
}

function convertSettingsConfig(
    settings: docsYml.RawSchemas.DocsSettingsConfig | undefined
): docsYml.ParsedDocsConfiguration["settings"] {
    if (settings == null) {
        return undefined;
    }

    return {
        darkModeCode: settings.darkModeCode ?? false,
        defaultSearchFilters: settings.defaultSearchFilters ?? false,
        disableSearch: settings.disableSearch ?? false,
        hide404Page: settings.hide404Page ?? false,
        httpSnippets: settings.httpSnippets ?? true,
        searchText: settings.searchText ?? "Search",
        useJavascriptAsTypescript: settings.useJavascriptAsTypescript ?? false
    };
}

function convertLayoutConfig(
    layout: docsYml.RawSchemas.LayoutConfig | undefined
): docsYml.ParsedDocsConfiguration["layout"] {
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
                ? CjsFdrSdk.docs.v1.commons.SearchbarPlacement.Header
                : layout.searchbarPlacement === "header-tabs"
                  ? CjsFdrSdk.docs.v1.commons.SearchbarPlacement.HeaderTabs
                  : CjsFdrSdk.docs.v1.commons.SearchbarPlacement.Sidebar,
        tabsPlacement:
            layout.tabsPlacement === "header"
                ? CjsFdrSdk.docs.v1.commons.TabsPlacement.Header
                : CjsFdrSdk.docs.v1.commons.TabsPlacement.Sidebar,
        contentAlignment:
            layout.contentAlignment === "left"
                ? CjsFdrSdk.docs.v1.commons.ContentAlignment.Left
                : CjsFdrSdk.docs.v1.commons.ContentAlignment.Center,
        headerPosition:
            layout.headerPosition === "static"
                ? CjsFdrSdk.docs.v1.commons.HeaderPosition.Absolute
                : CjsFdrSdk.docs.v1.commons.HeaderPosition.Fixed,
        disableHeader: layout.disableHeader ?? false,
        hideNavLinks: layout.hideNavLinks ?? false,
        hideFeedback: layout.hideFeedback ?? false
    };
}

function parseSizeConfig(sizeAsString: string | undefined): CjsFdrSdk.docs.v1.commons.SizeConfig | undefined {
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

async function getVersionedNavigationConfiguration({
    versions,
    absolutePathToFernFolder,
    context
}: {
    versions: docsYml.RawSchemas.VersionConfig[];
    absolutePathToFernFolder: AbsoluteFilePath;
    context: TaskContext;
    parentSlug?: string;
}): Promise<docsYml.VersionedDocsNavigation> {
    const versionedNavbars: docsYml.VersionInfo[] = [];
    for (const version of versions) {
        const absoluteFilepathToVersionFile = resolve(absolutePathToFernFolder, version.path);
        const versionContent = yaml.load((await readFile(absoluteFilepathToVersionFile)).toString());
        const versionResult = docsYml.RawSchemas.Serializer.VersionFileConfig.parseOrThrow(versionContent);
        const versionNavigation = await convertNavigationConfiguration({
            tabs: versionResult.tabs,
            rawNavigationConfig: versionResult.navigation,
            absolutePathToFernFolder,
            absolutePathToConfig: absoluteFilepathToVersionFile,
            context
        });
        versionedNavbars.push({
            landingPage: parsePageConfig(versionResult.landingPage, absoluteFilepathToVersionFile),
            version: version.displayName,
            navigation: versionNavigation,
            availability: version.availability,
            slug: version.slug,
            viewers: parseRoles(version.viewers),
            orphaned: version.orphaned,
            featureFlags: convertFeatureFlag(version.featureFlag)
        });
    }
    return {
        type: "versioned",
        versions: versionedNavbars
    };
}

async function getNavigationConfiguration({
    tabs,
    products,
    versions,
    navigation,
    absolutePathToFernFolder,
    absolutePathToConfig,
    context
}: {
    tabs?: Record<string, docsYml.RawSchemas.TabConfig>;
    products?: docsYml.RawSchemas.ProductConfig[];
    versions?: docsYml.RawSchemas.VersionConfig[];
    navigation?: docsYml.RawSchemas.NavigationConfig;
    absolutePathToFernFolder: AbsoluteFilePath;
    absolutePathToConfig: AbsoluteFilePath;
    context: TaskContext;
}): Promise<docsYml.DocsNavigationConfiguration> {
    if (navigation != null) {
        return await convertNavigationConfiguration({
            tabs,
            rawNavigationConfig: navigation,
            absolutePathToFernFolder,
            absolutePathToConfig,
            context
        });
    } else if (products != null) {
        const productNavbars: docsYml.ProductInfo[] = [];
        for (const product of products) {
            const absoluteFilepathToProductFile = resolve(absolutePathToFernFolder, product.path);
            const productImageFile =
                product.image != null ? resolve(absolutePathToFernFolder, product.image) : undefined;
            const content = yaml.load((await readFile(absoluteFilepathToProductFile)).toString());
            const result = docsYml.RawSchemas.Serializer.ProductFileConfig.parseOrThrow(content);

            let navigation: docsYml.DocsNavigationConfiguration;

            // If the product has versions defined, process them
            if (product.versions != null && product.versions.length > 0) {
                navigation = await getVersionedNavigationConfiguration({
                    versions: product.versions,
                    absolutePathToFernFolder,
                    context
                });
            } else {
                // Process as a regular navigation if no versions
                navigation = await convertNavigationConfiguration({
                    tabs: result.tabs,
                    rawNavigationConfig: result.navigation,
                    absolutePathToFernFolder,
                    absolutePathToConfig: absoluteFilepathToProductFile,
                    context
                });
            }

            productNavbars.push({
                landingPage: parsePageConfig(result.landingPage, absoluteFilepathToProductFile),
                product: product.displayName,
                navigation,
                slug: product.slug,
                subtitle: product.subtitle,
                icon: product.icon || "fa-solid fa-code",
                image: productImageFile,
                viewers: parseRoles(product.viewers),
                orphaned: product.orphaned,
                featureFlags: convertFeatureFlag(product.featureFlag)
            });
        }

        return {
            type: "productgroup",
            products: productNavbars
        };
    } else if (versions != null) {
        return await getVersionedNavigationConfiguration({ versions, absolutePathToFernFolder, context });
    }
    throw new Error("Unexpected. Docs have neither navigation or versions defined.");
}

function convertFeatureFlag(
    flag: docsYml.RawSchemas.FeatureFlagConfiguration | undefined
): CjsFdrSdk.navigation.latest.FeatureFlagOptions[] | undefined {
    if (flag == null) {
        return undefined;
    }
    if (typeof flag === "string") {
        return [
            {
                flag,
                match: true,
                fallbackValue: undefined
            }
        ];
    } else if (Array.isArray(flag)) {
        return flag.map((flagItem) => ({
            flag: flagItem.flag,
            match: flagItem.match,
            fallbackValue: flagItem.fallbackValue
        }));
    } else {
        return [
            {
                flag: flag.flag,
                match: flag.match ?? true,
                fallbackValue: flag.fallbackValue
            }
        ];
    }
}

async function convertTypographyConfiguration({
    rawTypography,
    absoluteFilepathToDocsConfig
}: {
    rawTypography: docsYml.RawSchemas.DocsTypographyConfig;
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
}): Promise<docsYml.TypographyConfig> {
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
    rawFontConfig: docsYml.RawSchemas.FontConfig;
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
}): Promise<docsYml.FontConfig> {
    return {
        name: rawFontConfig.name,
        variants: await constructVariants(rawFontConfig, absoluteFilepathToDocsConfig),
        display: rawFontConfig.display,
        fallback: rawFontConfig.fallback,
        fontVariationSettings: rawFontConfig.fontVariationSettings
    };
}

function constructVariants(
    rawFontConfig: docsYml.RawSchemas.FontConfig,
    absoluteFilepathToDocsConfig: AbsoluteFilePath
): Promise<docsYml.FontConfig["variants"]> {
    const variants: docsYml.RawSchemas.FontConfigVariant[] = [];

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

function parseWeight(weight: string | number | undefined): string[] | undefined {
    if (weight == null) {
        return undefined;
    }

    if (typeof weight === "number") {
        return [weight.toString()];
    }

    const weights = weight
        .split(/\D+/)
        .filter(
            (item) => item !== "" && ["100", "200", "300", "400", "500", "600", "700", "800", "900"].includes(item)
        );

    return weights;
}

async function convertNavigationTabConfiguration({
    tabs,
    item,
    absolutePathToFernFolder,
    absolutePathToConfig,
    context
}: {
    tabs: Record<string, docsYml.RawSchemas.TabConfig>;
    item: docsYml.RawSchemas.TabbedNavigationItem;
    absolutePathToFernFolder: AbsoluteFilePath;
    absolutePathToConfig: AbsoluteFilePath;
    context: TaskContext;
}): Promise<docsYml.TabbedNavigation> {
    const tab = tabs[item.tab];
    if (tab == null) {
        throw new Error(`Tab ${item.tab} is not defined in the tabs config.`);
    }

    if (tabbedNavigationItemHasVariants(item)) {
        const variants: docsYml.TabVariant[] = await Promise.all(
            item.variants.map(async (variant) => {
                const layout = await Promise.all(
                    variant.layout.map((layoutItem) =>
                        convertNavigationItem({
                            rawConfig: layoutItem,
                            absolutePathToFernFolder,
                            absolutePathToConfig,
                            context
                        })
                    )
                );
                return {
                    title: variant.title,
                    subtitle: variant.subtitle,
                    icon: variant.icon,
                    layout,
                    slug: variant.slug,
                    skipUrlSlug: variant.skipSlug,
                    hidden: variant.hidden,
                    viewers: parseRoles(variant.viewers),
                    orphaned: variant.orphaned,
                    featureFlags: convertFeatureFlag(variant.featureFlag)
                };
            })
        );
        return {
            title: tab.displayName,
            icon: tab.icon,
            slug: tab.slug,
            skipUrlSlug: tab.skipSlug,
            hidden: tab.hidden,
            child: {
                type: "variants",
                variants
            },
            viewers: parseRoles(tab.viewers),
            orphaned: tab.orphaned,
            featureFlags: convertFeatureFlag(tab.featureFlag)
        };
    }

    if (tabbedNavigationItemHasLayout(item)) {
        const layout = await Promise.all(
            item.layout.map((item) =>
                convertNavigationItem({ rawConfig: item, absolutePathToFernFolder, absolutePathToConfig, context })
            )
        );
        return {
            title: tab.displayName,
            icon: tab.icon,
            slug: tab.slug,
            skipUrlSlug: tab.skipSlug,
            hidden: tab.hidden,
            child: {
                type: "layout",
                layout
            },
            viewers: parseRoles(tab.viewers),
            orphaned: tab.orphaned,
            featureFlags: convertFeatureFlag(tab.featureFlag)
        };
    }

    if (tab.href != null) {
        return {
            title: tab.displayName,
            icon: tab.icon,
            slug: tab.slug,
            skipUrlSlug: tab.skipSlug,
            hidden: tab.hidden,
            child: {
                type: "link",
                href: tab.href
            },
            viewers: parseRoles(tab.viewers),
            orphaned: tab.orphaned,
            featureFlags: convertFeatureFlag(tab.featureFlag)
        };
    }

    if (tab.changelog != null) {
        return {
            title: tab.displayName,
            icon: tab.icon,
            slug: tab.slug,
            skipUrlSlug: tab.skipSlug,
            hidden: tab.hidden,
            child: {
                type: "changelog",
                changelog: await listFiles(resolveFilepath(tab.changelog, absolutePathToConfig), "{md,mdx}")
            },
            viewers: parseRoles(tab.viewers),
            orphaned: tab.orphaned,
            featureFlags: convertFeatureFlag(tab.featureFlag)
        };
    }

    assertNever(tab as never);
}

async function convertNavigationConfiguration({
    tabs = {},
    rawNavigationConfig,
    absolutePathToFernFolder,
    absolutePathToConfig,
    context
}: {
    tabs?: Record<string, docsYml.RawSchemas.TabConfig>;
    rawNavigationConfig: docsYml.RawSchemas.NavigationConfig;
    absolutePathToFernFolder: AbsoluteFilePath;
    absolutePathToConfig: AbsoluteFilePath;
    context: TaskContext;
}): Promise<docsYml.UntabbedDocsNavigation | docsYml.TabbedDocsNavigation> {
    if (isTabbedNavigationConfig(rawNavigationConfig)) {
        const tabbedNavigationItems = await Promise.all(
            rawNavigationConfig.map((item) =>
                convertNavigationTabConfiguration({
                    tabs,
                    item,
                    absolutePathToFernFolder,
                    absolutePathToConfig,
                    context
                })
            )
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

const DEFAULT_CHANGELOG_TITLE = "Changelog";

async function convertNavigationItem({
    rawConfig,
    absolutePathToFernFolder,
    absolutePathToConfig,
    context
}: {
    rawConfig: docsYml.RawSchemas.NavigationItem;
    absolutePathToFernFolder: AbsoluteFilePath;
    absolutePathToConfig: AbsoluteFilePath;
    context: TaskContext;
}): Promise<docsYml.DocsNavigationItem> {
    if (isRawPageConfig(rawConfig)) {
        return parsePageConfig(rawConfig, absolutePathToConfig);
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
            skipUrlSlug: rawConfig.skipSlug ?? false,
            overviewAbsolutePath: resolveFilepath(rawConfig.path, absolutePathToConfig),
            viewers: parseRoles(rawConfig.viewers),
            orphaned: rawConfig.orphaned,
            featureFlags: convertFeatureFlag(rawConfig.featureFlag),
            availability: rawConfig.availability
        };
    }
    if (isRawApiSectionConfig(rawConfig)) {
        return {
            type: "apiSection",
            openrpc: rawConfig.openrpc,
            title: rawConfig.api,
            icon: rawConfig.icon,
            apiName: rawConfig.apiName ?? undefined,
            audiences:
                rawConfig.audiences != null
                    ? { type: "select", audiences: parseAudiences(rawConfig.audiences) ?? [] }
                    : { type: "all" },
            availability: rawConfig.availability,
            showErrors: rawConfig.displayErrors ?? true,
            snippetsConfiguration:
                rawConfig.snippets != null
                    ? convertSnippetsConfiguration({ rawConfig: rawConfig.snippets })
                    : undefined,
            navigation:
                rawConfig.layout?.flatMap((item) => parseApiReferenceLayoutItem(item, absolutePathToConfig)) ?? [],
            overviewAbsolutePath: resolveFilepath(rawConfig.summary, absolutePathToConfig),
            hidden: rawConfig.hidden ?? undefined,
            slug: rawConfig.slug,
            skipUrlSlug: rawConfig.skipSlug ?? false,
            flattened: rawConfig.flattened ?? false,
            alphabetized: rawConfig.alphabetized ?? false,
            paginated: rawConfig.paginated ?? false,
            playground: rawConfig.playground,
            viewers: parseRoles(rawConfig.viewers),
            orphaned: rawConfig.orphaned,
            featureFlags: convertFeatureFlag(rawConfig.featureFlag)
        };
    }
    if (isRawLinkConfig(rawConfig)) {
        return {
            type: "link",
            text: rawConfig.link,
            url: rawConfig.href,
            icon: rawConfig.icon
        };
    }
    if (isRawChangelogConfig(rawConfig)) {
        return {
            type: "changelog",
            changelog: await listFiles(resolveFilepath(rawConfig.changelog, absolutePathToConfig), "{md,mdx}"),
            hidden: rawConfig.hidden ?? false,
            icon: rawConfig.icon,
            title: rawConfig.title ?? DEFAULT_CHANGELOG_TITLE,
            slug: rawConfig.slug,
            viewers: parseRoles(rawConfig.viewers),
            orphaned: rawConfig.orphaned,
            featureFlags: convertFeatureFlag(rawConfig.featureFlag)
        };
    }
    assertNever(rawConfig);
}

function parsePageConfig(
    item: docsYml.RawSchemas.PageConfiguration,
    absolutePathToConfig: AbsoluteFilePath
): docsYml.DocsNavigationItem.Page;
function parsePageConfig(
    item: docsYml.RawSchemas.PageConfiguration | undefined,
    absolutePathToConfig: AbsoluteFilePath
): docsYml.DocsNavigationItem.Page | undefined;
function parsePageConfig(
    item: docsYml.RawSchemas.PageConfiguration | undefined,
    absolutePathToConfig: AbsoluteFilePath
): docsYml.DocsNavigationItem.Page | undefined {
    if (item == null) {
        return undefined;
    }
    return {
        type: "page",
        title: item.page,
        absolutePath: resolveFilepath(item.path, absolutePathToConfig),
        slug: item.slug,
        icon: item.icon,
        hidden: item.hidden,
        noindex: item.noindex,
        viewers: parseRoles(item.viewers),
        orphaned: item.orphaned,
        featureFlags: convertFeatureFlag(item.featureFlag),
        availability: item.availability
    };
}

function parseApiReferenceLayoutItem(
    item: docsYml.RawSchemas.ApiReferenceLayoutItem,
    absolutePathToConfig: AbsoluteFilePath
): docsYml.ParsedApiReferenceLayoutItem[] {
    if (typeof item === "string") {
        return [{ type: "item", value: item }];
    }

    if (isRawPageConfig(item)) {
        return [parsePageConfig(item, absolutePathToConfig)];
    } else if (isRawLinkConfig(item)) {
        return [
            {
                type: "link",
                text: item.link,
                url: item.href,
                icon: item.icon
            }
        ];
    } else if (isRawApiRefSectionConfiguration(item)) {
        return [
            {
                type: "section",
                title: item.section,
                referencedSubpackages: item.referencedPackages ?? [],
                overviewAbsolutePath: resolveFilepath(item.summary, absolutePathToConfig),
                contents:
                    item.contents?.flatMap((value) => parseApiReferenceLayoutItem(value, absolutePathToConfig)) ?? [],
                slug: item.slug,
                hidden: item.hidden,
                skipUrlSlug: item.skipSlug,
                availability: item.availability,
                icon: item.icon,
                playground: item.playground,
                viewers: parseRoles(item.viewers),
                orphaned: item.orphaned,
                featureFlags: convertFeatureFlag(item.featureFlag)
            }
        ];
    } else if (isRawApiRefEndpointConfiguration(item)) {
        return [
            {
                type: "endpoint",
                endpoint: item.endpoint,
                title: item.title,
                icon: item.icon,
                slug: item.slug,
                hidden: item.hidden,
                availability: item.availability,
                playground: item.playground,
                viewers: parseRoles(item.viewers),
                orphaned: item.orphaned,
                featureFlags: convertFeatureFlag(item.featureFlag)
            }
        ];
    }
    return Object.entries(item).map(([key, value]): docsYml.ParsedApiReferenceLayoutItem.Package => {
        if (isRawApiRefPackageConfiguration(value)) {
            return {
                type: "package",
                title: value.title,
                package: key,
                overviewAbsolutePath: resolveFilepath(value.summary, absolutePathToConfig),
                contents:
                    value.contents?.flatMap((value) => parseApiReferenceLayoutItem(value, absolutePathToConfig)) ?? [],
                slug: value.slug,
                hidden: value.hidden,
                skipUrlSlug: value.skipSlug,
                icon: value.icon,
                playground: value.playground,
                availability: value.availability,
                viewers: parseRoles(value.viewers),
                orphaned: value.orphaned,
                featureFlags: convertFeatureFlag(value.featureFlag)
            };
        }
        return {
            type: "package",
            title: undefined,
            package: key,
            overviewAbsolutePath: undefined,
            contents: value.flatMap((value) => parseApiReferenceLayoutItem(value, absolutePathToConfig)),
            hidden: false,
            slug: undefined,
            skipUrlSlug: false,
            icon: undefined,
            playground: undefined,
            availability: undefined,
            viewers: undefined,
            orphaned: undefined,
            featureFlags: undefined
        };
    });
}

function convertSnippetsConfiguration({
    rawConfig
}: {
    rawConfig: docsYml.RawSchemas.SnippetsConfiguration;
}): docsYml.DocsNavigationItem.SnippetsConfiguration {
    return {
        python: rawConfig.python,
        typescript: rawConfig.typescript,
        go: rawConfig.go,
        java: rawConfig.java,
        ruby: rawConfig.ruby,
        csharp: rawConfig.csharp,
        php: rawConfig.php,
        swift: rawConfig.swift
    };
}

function isRawPageConfig(item: unknown): item is docsYml.RawSchemas.PageConfiguration {
    return isPlainObject(item) && typeof item.page === "string" && typeof item.path === "string";
}

function isRawSectionConfig(item: docsYml.RawSchemas.NavigationItem): item is docsYml.RawSchemas.SectionConfiguration {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (item as docsYml.RawSchemas.SectionConfiguration).section != null;
}

function isRawApiSectionConfig(
    item: docsYml.RawSchemas.NavigationItem
): item is docsYml.RawSchemas.ApiReferenceConfiguration {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (item as docsYml.RawSchemas.ApiReferenceConfiguration).api != null;
}

function isRawLinkConfig(item: unknown): item is docsYml.RawSchemas.LinkConfiguration {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    docsYml.RawSchemas;
    return isPlainObject(item) && typeof item.link === "string" && typeof item.href === "string";
}

function isRawChangelogConfig(item: unknown): item is docsYml.RawSchemas.ChangelogConfiguration {
    return isPlainObject(item) && typeof item.changelog === "string";
}

function isRawApiRefSectionConfiguration(item: unknown): item is docsYml.RawSchemas.ApiReferenceSectionConfiguration {
    return isPlainObject(item) && typeof item.section === "string" && Array.isArray(item.contents);
}

function isRawApiRefEndpointConfiguration(item: unknown): item is docsYml.RawSchemas.ApiReferenceEndpointConfiguration {
    return isPlainObject(item) && typeof item.endpoint === "string";
}

function isRawApiRefPackageConfiguration(
    item: docsYml.RawSchemas.ApiReferencePackageConfiguration
): item is docsYml.RawSchemas.ApiReferencePackageConfigurationWithOptions {
    return !Array.isArray(item);
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
    navigationConfig: docsYml.RawSchemas.NavigationConfig
): navigationConfig is docsYml.RawSchemas.TabbedNavigationConfig {
    return (
        Array.isArray(navigationConfig) &&
        navigationConfig.length > 0 &&
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (navigationConfig[0] as docsYml.RawSchemas.TabbedNavigationItem).tab != null
    );
}

function tabbedNavigationItemHasLayout(
    item: docsYml.RawSchemas.TabbedNavigationItem
): item is docsYml.RawSchemas.TabbedNavigationItemWithLayout & {
    layout: docsYml.RawSchemas.NavigationItem[];
} {
    return "layout" in item && Array.isArray(item.layout);
}

function tabbedNavigationItemHasVariants(
    item: docsYml.RawSchemas.TabbedNavigationItem
): item is docsYml.RawSchemas.TabbedNavigationItemWithVariants & {
    variants: docsYml.RawSchemas.TabVariant[];
} {
    return "variants" in item && Array.isArray(item.variants);
}

function convertNavbarLinks(
    navbarLinks: docsYml.RawSchemas.NavbarLink[] | undefined
): CjsFdrSdk.docs.v1.commons.NavbarLink[] | undefined {
    return navbarLinks?.map((navbarLink): WithoutQuestionMarks<CjsFdrSdk.docs.v1.commons.NavbarLink> => {
        if (navbarLink.type === "github") {
            return { type: "github", url: CjsFdrSdk.Url(navbarLink.value) };
        }

        return {
            type: navbarLink.type,
            text: navbarLink.text,
            url: CjsFdrSdk.Url(navbarLink.href ?? navbarLink.url ?? "/"),
            icon: navbarLink.icon,
            rightIcon: navbarLink.rightIcon,
            rounded: navbarLink.rounded
        };
    });
}

function convertFooterLinks(
    footerLinks: docsYml.RawSchemas.FooterLinksConfig | undefined
): CjsFdrSdk.docs.v1.commons.FooterLink[] | undefined {
    if (footerLinks == null) {
        return undefined;
    }

    const links: CjsFdrSdk.docs.v1.commons.FooterLink[] = [];

    (Object.keys(footerLinks) as (keyof docsYml.RawSchemas.FooterLinksConfig)[]).forEach((key) => {
        const link = footerLinks[key];
        if (link == null) {
            return;
        }
        links.push({ type: key, value: CjsFdrSdk.Url(link) });
    });

    if (links.length === 0) {
        return undefined;
    }

    return links;
}

async function convertMetadata(
    metadata: docsYml.RawSchemas.MetadataConfig | undefined,
    absoluteFilepathToDocsConfig: AbsoluteFilePath
): Promise<docsYml.ParsedMetadataConfig | undefined> {
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
        "twitter:card": metadata.twitterCard,
        nofollow: undefined,
        noindex: undefined,
        canonicalHost: metadata.canonicalHost
    };
}

async function convertFilepathOrUrl(
    value: string | undefined,
    absoluteFilepathToDocsConfig: AbsoluteFilePath
): Promise<docsYml.FilepathOrUrl | undefined> {
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

function parseRoles(raw: string | string[] | undefined): CjsFdrSdk.RoleId[] | undefined {
    if (raw == null) {
        return undefined;
    }

    if (typeof raw === "string") {
        return [CjsFdrSdk.RoleId(raw)];
    }

    if (raw.length === 0) {
        return undefined;
    }

    return raw.map(CjsFdrSdk.RoleId);
}

export function parseAudiences(raw: string | string[] | undefined): string[] | undefined {
    if (raw == null) {
        return undefined;
    }

    if (typeof raw === "string") {
        return [raw];
    }

    if (raw.length === 0) {
        return undefined;
    }

    return raw;
}
