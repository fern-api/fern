import { docsYml } from "@fern-api/configuration";
import { assertNever, isPlainObject, sanitizeNullValues } from "@fern-api/core-utils";
import { FdrAPI as CjsFdrSdk } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, dirname, doesPathExist, listFiles, resolve } from "@fern-api/fs-utils";
import { CliError, TaskContext } from "@fern-api/task-context";

import { readFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";

import { WithoutQuestionMarks } from "../commons/WithoutQuestionMarks.js";
import { convertColorsConfiguration } from "./convertColorsConfiguration.js";
import { getAllPages, loadAllPages } from "./getAllPages.js";
import { buildNavigationForDirectory, getFrontmatterMetadata, nameToSlug, nameToTitle } from "./navigationUtils.js";

function shouldProcessIconPath(iconPath?: string): boolean {
    if (!iconPath || iconPath.startsWith("<")) {
        return false;
    }

    return (
        iconPath.startsWith(".") || // check for mac + linux relative paths
        iconPath.includes("/") ||
        iconPath.includes("\\") || // check for windows relative paths
        iconPath.includes(":")
    );
}

function resolveIconPath(
    iconPath: string | undefined,
    absoluteFilepathToDocsConfig: AbsoluteFilePath
): AbsoluteFilePath | string | undefined {
    if (!iconPath) {
        return undefined;
    }
    if (shouldProcessIconPath(iconPath)) {
        return resolveFilepath(iconPath, absoluteFilepathToDocsConfig);
    }
    return iconPath;
}

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

        agents,

        pageActions,

        experimental
    } = rawDocsConfiguration;

    const landingPage = parsePageConfig(rawDocsConfiguration.landingPage, absoluteFilepathToDocsConfig);

    const folderTitleSource = rawDocsConfiguration.settings?.folderTitleSource;

    const convertedNavigationPromise = getNavigationConfiguration({
        tabs,
        products,
        versions,
        navigation: rawNavigation,
        absolutePathToFernFolder,
        absolutePathToConfig: absoluteFilepathToDocsConfig,
        context,
        folderTitleSource
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

    const metadataPromise = convertMetadata(rawMetadata, absoluteFilepathToDocsConfig, context);

    const context7FilePromise = parseContext7File({
        rawPath: rawDocsConfiguration.integrations?.context7,
        absoluteFilepathToDocsConfig,
        context
    });

    const llmsTxtFilePromise = parseTextFile({
        rawPath: agents?.llmsTxt,
        absoluteFilepathToDocsConfig
    });

    const llmsFullTxtFilePromise = parseTextFile({
        rawPath: agents?.llmsFullTxt,
        absoluteFilepathToDocsConfig
    });

    const [navigation, pages, typography, css, js, metadata, context7File, llmsTxtFile, llmsFullTxtFile] =
        await Promise.all([
            convertedNavigationPromise,
            pagesPromise,
            typographyPromise,
            cssPromise,
            jsPromise,
            metadataPromise,
            context7FilePromise,
            llmsTxtFilePromise,
            llmsFullTxtFilePromise
        ]);

    // Validate incompatible tabs configuration: sidebar placement + center alignment
    const resolvedTheme = convertThemeConfig(rawDocsConfiguration.theme);
    const tabsObj =
        resolvedTheme?.tabs != null && typeof resolvedTheme.tabs === "object" ? resolvedTheme.tabs : undefined;
    const effectivePlacement = tabsObj?.placement ?? layout?.tabsPlacement ?? "sidebar";
    const effectiveAlignment = tabsObj?.alignment ?? "left";
    if (effectivePlacement === "sidebar" && effectiveAlignment === "center") {
        context.logger.warn(
            "Tabs alignment 'center' is not supported when tabs placement is 'sidebar'. The alignment will be ignored."
        );
    }

    return {
        title,
        // absoluteFilepath: absoluteFilepathToDocsConfig,
        instances,
        roles: rawDocsConfiguration.roles,

        /* library documentation */
        libraries: parseLibrariesConfiguration(rawDocsConfiguration.libraries),

        /* filepath of page to contents */
        pages,

        /* navigation */
        landingPage,
        navigation,
        navbarLinks: convertNavbarLinks(navbarLinks, absoluteFilepathToDocsConfig),
        footerLinks: convertFooterLinks(footerLinks),
        defaultLanguage,
        languages: rawDocsConfiguration.languages,
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
        layout: convertLayoutConfig(layout, tabsObj?.alignment, tabsObj?.placement),
        settings: convertSettingsConfig(rawDocsConfiguration.settings),
        context7File,
        llmsTxtFile,
        llmsFullTxtFile,
        theme: resolvedTheme,
        globalTheme: rawDocsConfiguration.globalTheme,
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

        agents,

        pageActions: convertPageActions(pageActions, absoluteFilepathToDocsConfig),

        /* custom components */
        header: resolveFilepath(rawDocsConfiguration.header, absoluteFilepathToDocsConfig),
        footer: resolveFilepath(rawDocsConfiguration.footer, absoluteFilepathToDocsConfig),

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
              href: rawLogo.href != null ? CjsFdrSdk.Url(rawLogo.href) : undefined,
              rightText: rawLogo.rightText
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
    pageActions: docsYml.RawSchemas.PageActionsConfig | undefined,
    absoluteFilepathToDocsConfig: AbsoluteFilePath
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
            openAi: pageActions.options?.chatgpt ?? true,
            claude: pageActions.options?.claude ?? true,
            cursor: pageActions.options?.cursor ?? true,
            claudeCode: pageActions.options?.claudeCode ?? true,
            vscode: pageActions.options?.vscode ?? false,
            custom: (pageActions.options?.custom ?? []).map((action) =>
                convertCustomPageAction(action, absoluteFilepathToDocsConfig)
            )
        }
    };
}

function convertPageActionOption(
    option: docsYml.RawSchemas.PageActionOption
): CjsFdrSdk.docs.v1.commons.PageActionOption {
    switch (option) {
        case "copy-page":
            return "copyPage";
        case "view-as-markdown":
            return "viewAsMarkdown";
        case "ask-ai":
            return "askAi";
        case "chatgpt":
            return "openAi";
        case "claude":
            return "claude";
        case "cursor":
            return "cursor";
        case "claude-code":
            return "claudeCode";
        case "vscode":
            return "vscode";
        default:
            assertNever(option);
    }
}

function convertCustomPageAction(
    customAction: docsYml.RawSchemas.CustomPageAction,
    absoluteFilepathToDocsConfig: AbsoluteFilePath
): docsYml.ParsedCustomPageAction {
    return {
        title: customAction.title,
        subtitle: customAction.subtitle,
        url: customAction.url,
        icon: resolveIconPath(customAction.icon, absoluteFilepathToDocsConfig),
        default: customAction.default
    };
}

function convertThemeConfig(
    theme: docsYml.RawSchemas.ThemeConfig | undefined
): docsYml.ParsedDocsConfiguration["theme"] {
    if (theme == null) {
        return undefined;
    }

    // theme.tabs can be a string ("default"|"bubble") or an object { style?, alignment?, placement? }
    let resolvedTabs: docsYml.RawSchemas.TabsThemeConfig | undefined;
    if (theme.tabs != null && typeof theme.tabs === "object") {
        const tabsObj = theme.tabs as docsYml.RawSchemas.TabsThemeObjectConfig;
        resolvedTabs = {
            style: tabsObj.style ?? "default",
            alignment: tabsObj.alignment,
            placement: tabsObj.placement
        };
    } else {
        resolvedTabs = (theme.tabs as docsYml.RawSchemas.TabsThemeStyle | undefined) ?? "default";
    }

    return {
        sidebar: theme.sidebar ?? "default",
        tabs: resolvedTabs,
        body: theme.body ?? "default",
        pageActions: theme.pageActions ?? "default",
        footerNav: theme.footerNav ?? "default",
        languageSwitcher: theme.languageSwitcher ?? "default",
        productSwitcher: theme.productSwitcher ?? "default"
    };
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
        language: settings.language ?? "en",
        disableSearch: settings.disableSearch ?? false,
        hide404Page: settings.hide404Page ?? false,
        httpSnippets: settings.httpSnippets ?? true,
        searchText: settings.searchText ?? undefined,
        useJavascriptAsTypescript: settings.useJavascriptAsTypescript ?? false,
        disableExplorerProxy: settings.disableExplorerProxy ?? false,
        disableEnvironmentEditing: settings.disableEnvironmentEditing ?? false,
        disableAnalytics: settings.disableAnalytics ?? false
    };
}

async function parseTextFile({
    rawPath,
    absoluteFilepathToDocsConfig
}: {
    rawPath: string | undefined;
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
}): Promise<AbsoluteFilePath | undefined> {
    if (rawPath == null) {
        return undefined;
    }

    const absolutePath = resolveFilepath(rawPath, absoluteFilepathToDocsConfig);
    await readFile(absolutePath, "utf8");

    return absolutePath;
}

async function parseContext7File({
    rawPath,
    absoluteFilepathToDocsConfig,
    context
}: {
    rawPath: string | undefined;
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
    context: TaskContext;
}): Promise<AbsoluteFilePath | undefined> {
    if (rawPath == null) {
        return undefined;
    }

    const absolutePath = resolveFilepath(rawPath, absoluteFilepathToDocsConfig);
    const contents = await readFile(absolutePath, "utf8");

    try {
        JSON.parse(contents);
    } catch (error) {
        context.failAndThrow(
            `Invalid JSON in Context7 config file: ${rawPath}`,
            error instanceof Error ? error.message : String(error),
            { code: CliError.Code.ConfigError }
        );
    }

    return absolutePath;
}

function convertLayoutConfig(
    layout: docsYml.RawSchemas.LayoutConfig | undefined,
    themeTabsAlignment: string | undefined,
    themeTabsPlacement: string | undefined
): docsYml.ParsedDocsConfiguration["layout"] {
    if (layout == null && themeTabsAlignment == null && themeTabsPlacement == null) {
        return undefined;
    }

    // tabsAlignment is resolved from theme.tabs.alignment, not layout.
    // Cast needed until the fern-platform companion PR merges and the SDK is updated.
    const resolvedTabsAlignment = themeTabsAlignment === "center" ? "CENTER" : "LEFT";

    // tabsPlacement: theme.tabs.placement overrides layout.tabs-placement.
    const resolvedTabsPlacement =
        themeTabsPlacement === "header" ? "HEADER" : themeTabsPlacement === "sidebar" ? "SIDEBAR" : undefined;

    if (layout == null) {
        // No layout section, but theme.tabs properties are set — return minimal layout.
        return {
            ...(resolvedTabsPlacement != null ? { tabsPlacement: resolvedTabsPlacement } : {}),
            tabsAlignment: resolvedTabsAlignment
        } as unknown as docsYml.ParsedDocsConfiguration["layout"];
    }

    return {
        pageWidth:
            layout.pageWidth?.trim().toLowerCase() === "full" ? { type: "full" } : parseSizeConfig(layout.pageWidth),
        contentWidth: parseSizeConfig(layout.contentWidth),
        sidebarWidth: parseSizeConfig(layout.sidebarWidth),
        headerHeight: parseSizeConfig(layout.headerHeight),

        searchbarPlacement:
            layout.searchbarPlacement === "header"
                ? "HEADER"
                : layout.searchbarPlacement === "header-tabs"
                  ? "HEADER_TABS"
                  : "SIDEBAR",
        switcherPlacement: !layout.switcherPlacement || layout.switcherPlacement === "header" ? "HEADER" : "SIDEBAR",
        tabsPlacement: resolvedTabsPlacement ?? (layout.tabsPlacement === "header" ? "HEADER" : "SIDEBAR"),
        contentAlignment: layout.contentAlignment === "left" ? "LEFT" : "CENTER",
        headerPosition: layout.headerPosition === "static" ? "ABSOLUTE" : "FIXED",
        disableHeader: layout.disableHeader ?? false,
        hideNavLinks: layout.hideNavLinks ?? false,
        hideFeedback: layout.hideFeedback ?? false,
        mobileToc: layout.mobileToc ?? false,
        tabsAlignment: resolvedTabsAlignment
    } as unknown as docsYml.ParsedDocsConfiguration["layout"];
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
    context,
    folderTitleSource
}: {
    versions: docsYml.RawSchemas.VersionConfig[];
    absolutePathToFernFolder: AbsoluteFilePath;
    context: TaskContext;
    parentSlug?: string;
    folderTitleSource?: docsYml.RawSchemas.TitleSource;
}): Promise<docsYml.VersionedDocsNavigation> {
    const versionedNavbars: docsYml.VersionInfo[] = [];
    for (const version of versions) {
        const absoluteFilepathToVersionFile = resolve(absolutePathToFernFolder, version.path);
        const versionContent = yaml.load((await readFile(absoluteFilepathToVersionFile)).toString());

        // Sanitize null/undefined values before parsing
        const removedPaths: string[][] = [];
        const sanitizedVersionContent = sanitizeNullValues(versionContent, [], removedPaths);
        if (removedPaths.length > 0) {
            context.logger.warn(
                `Version file ${version.path} contained null/undefined sections that were ignored: ${removedPaths.map((p) => p.join(".")).join(", ")}`
            );
        }

        const versionResult = docsYml.RawSchemas.Serializer.VersionFileConfig.parseOrThrow(sanitizedVersionContent);
        const versionNavigation = await convertNavigationConfiguration({
            tabs: versionResult.tabs,
            rawNavigationConfig: versionResult.navigation,
            absolutePathToFernFolder,
            absolutePathToConfig: absoluteFilepathToVersionFile,
            context,
            folderTitleSource
        });
        versionedNavbars.push({
            landingPage: parsePageConfig(versionResult.landingPage, absoluteFilepathToVersionFile),
            version: version.displayName,
            navigation: versionNavigation,
            availability: version.availability,
            slug: version.slug,
            hidden: version.hidden,
            viewers: parseRoles(version.viewers),
            orphaned: version.orphaned,
            featureFlags: convertFeatureFlag(version.featureFlag),
            announcement: version.announcement
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
    context,
    folderTitleSource
}: {
    tabs?: Record<string, docsYml.RawSchemas.TabConfig>;
    products?: docsYml.RawSchemas.ProductConfig[];
    versions?: docsYml.RawSchemas.VersionConfig[];
    navigation?: docsYml.RawSchemas.NavigationConfig;
    absolutePathToFernFolder: AbsoluteFilePath;
    absolutePathToConfig: AbsoluteFilePath;
    context: TaskContext;
    folderTitleSource?: docsYml.RawSchemas.TitleSource;
}): Promise<docsYml.DocsNavigationConfiguration> {
    if (navigation != null) {
        return await convertNavigationConfiguration({
            tabs,
            rawNavigationConfig: navigation,
            absolutePathToFernFolder,
            absolutePathToConfig,
            context,
            folderTitleSource
        });
    } else if (products != null) {
        const productNavbars: docsYml.ProductInfo[] = [];
        for (const product of products) {
            const productImageFile =
                product.image != null ? resolve(absolutePathToFernFolder, product.image) : undefined;

            if ("path" in product) {
                let navigation: docsYml.DocsNavigationConfiguration;
                const absoluteFilepathToProductFile = resolve(absolutePathToFernFolder, product.path);

                const content = yaml.load((await readFile(absoluteFilepathToProductFile)).toString());

                // Sanitize null/undefined values before parsing
                const removedPaths: string[][] = [];
                const sanitizedContent = sanitizeNullValues(content, [], removedPaths);
                if (removedPaths.length > 0) {
                    context.logger.warn(
                        `Product file ${product.path} contained null/undefined sections that were ignored: ${removedPaths.map((p) => p.join(".")).join(", ")}`
                    );
                }

                const result = docsYml.RawSchemas.Serializer.ProductFileConfig.parseOrThrow(sanitizedContent);

                // If the product has versions defined, process them
                if (product.versions != null && product.versions.length > 0) {
                    navigation = await getVersionedNavigationConfiguration({
                        versions: product.versions,
                        absolutePathToFernFolder,
                        context,
                        folderTitleSource
                    });
                } else {
                    // Process as a regular navigation if no versions
                    navigation = await convertNavigationConfiguration({
                        tabs: result.tabs,
                        rawNavigationConfig: result.navigation,
                        absolutePathToFernFolder,
                        absolutePathToConfig: absoluteFilepathToProductFile,
                        context,
                        folderTitleSource
                    });
                }

                productNavbars.push({
                    type: "internal",
                    landingPage: parsePageConfig(result.landingPage, absoluteFilepathToProductFile),
                    product: product.displayName,
                    navigation,
                    slug: product.slug,
                    subtitle: product.subtitle,
                    icon: resolveIconPath(product.icon, absolutePathToConfig) || "fa-solid fa-code",
                    image: productImageFile,
                    viewers: parseRoles(product.viewers),
                    orphaned: product.orphaned,
                    featureFlags: convertFeatureFlag(product.featureFlag),
                    announcement: product.announcement
                });
            } else if ("href" in product && product.href != null) {
                productNavbars.push({
                    type: "external",
                    product: product.displayName,
                    href: product.href,
                    target: product.target,
                    subtitle: product.subtitle,
                    icon: resolveIconPath(product.icon, absolutePathToConfig) || "fa-solid fa-code",
                    image: productImageFile,
                    viewers: parseRoles(product.viewers),
                    orphaned: product.orphaned,
                    featureFlags: convertFeatureFlag(product.featureFlag)
                });
            } else {
                throw new CliError({
                    message: `Invalid product configuration: product must have either 'path' or valid 'href' property`,
                    code: CliError.Code.ConfigError
                });
            }
        }

        return {
            type: "productgroup",
            products: productNavbars
        };
    } else if (versions != null) {
        return await getVersionedNavigationConfiguration({
            versions,
            absolutePathToFernFolder,
            context,
            folderTitleSource
        });
    }
    throw new CliError({
        message: "Unexpected. Docs have neither navigation or versions defined.",
        code: CliError.Code.ConfigError
    });
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
    context,
    folderTitleSource
}: {
    tabs: Record<string, docsYml.RawSchemas.TabConfig>;
    item: docsYml.RawSchemas.TabbedNavigationItem;
    absolutePathToFernFolder: AbsoluteFilePath;
    absolutePathToConfig: AbsoluteFilePath;
    context: TaskContext;
    folderTitleSource?: docsYml.RawSchemas.TitleSource;
}): Promise<docsYml.TabbedNavigation> {
    const tab = tabs[item.tab];
    if (tab == null) {
        throw new CliError({
            message: `Tab ${item.tab} is not defined in the tabs config.`,
            code: CliError.Code.ConfigError
        });
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
                            context,
                            folderTitleSource
                        })
                    )
                );
                return {
                    title: variant.title,
                    subtitle: variant.subtitle,
                    icon: resolveIconPath(variant.icon, absolutePathToConfig),
                    layout,
                    slug: variant.slug,
                    skipUrlSlug: variant.skipSlug,
                    hidden: variant.hidden,
                    default: variant.default,
                    viewers: parseRoles(variant.viewers),
                    orphaned: variant.orphaned,
                    featureFlags: convertFeatureFlag(variant.featureFlag)
                };
            })
        );
        return {
            title: tab.displayName,
            icon: resolveIconPath(tab.icon, absolutePathToConfig),
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
                convertNavigationItem({
                    rawConfig: item,
                    absolutePathToFernFolder,
                    absolutePathToConfig,
                    context,
                    folderTitleSource
                })
            )
        );
        return {
            title: tab.displayName,
            icon: resolveIconPath(tab.icon, absolutePathToConfig),
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
            icon: resolveIconPath(tab.icon, absolutePathToConfig),
            slug: tab.slug,
            skipUrlSlug: tab.skipSlug,
            hidden: tab.hidden,
            child: {
                type: "link",
                href: tab.href,
                target: tab.target
            },
            viewers: parseRoles(tab.viewers),
            orphaned: tab.orphaned,
            featureFlags: convertFeatureFlag(tab.featureFlag)
        };
    }

    if (tab.changelog != null) {
        return {
            title: tab.displayName,
            icon: resolveIconPath(tab.icon, absolutePathToConfig),
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
    context,
    folderTitleSource
}: {
    tabs?: Record<string, docsYml.RawSchemas.TabConfig>;
    rawNavigationConfig: docsYml.RawSchemas.NavigationConfig;
    absolutePathToFernFolder: AbsoluteFilePath;
    absolutePathToConfig: AbsoluteFilePath;
    context: TaskContext;
    folderTitleSource?: docsYml.RawSchemas.TitleSource;
}): Promise<docsYml.UntabbedDocsNavigation | docsYml.TabbedDocsNavigation> {
    if (isTabbedNavigationConfig(rawNavigationConfig)) {
        const tabbedNavigationItems = await Promise.all(
            rawNavigationConfig.map((item) =>
                convertNavigationTabConfiguration({
                    tabs,
                    item,
                    absolutePathToFernFolder,
                    absolutePathToConfig,
                    context,
                    folderTitleSource
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
                    convertNavigationItem({
                        rawConfig: item,
                        absolutePathToFernFolder,
                        absolutePathToConfig,
                        context,
                        folderTitleSource
                    })
                )
            )
        };
    }
}

const DEFAULT_CHANGELOG_TITLE = "Changelog";

async function expandFolderConfiguration({
    rawConfig,
    absolutePathToFernFolder,
    absolutePathToConfig,
    context,
    folderTitleSource
}: {
    rawConfig: docsYml.RawSchemas.FolderConfiguration;
    absolutePathToFernFolder: AbsoluteFilePath;
    absolutePathToConfig: AbsoluteFilePath;
    context: TaskContext;
    folderTitleSource?: docsYml.RawSchemas.TitleSource;
}): Promise<docsYml.DocsNavigationItem> {
    const folderPath = resolveFilepath(rawConfig.folder, absolutePathToConfig);

    if (!(await doesPathExist(folderPath))) {
        context.failAndThrow(`Folder not found: ${rawConfig.folder}`, undefined, {
            code: CliError.Code.ConfigError
        });
    }

    validateCollapsibleConfig({
        context,
        sectionTitle: rawConfig.folder,
        collapsed: rawConfig.collapsed ?? undefined,
        collapsible: rawConfig.collapsible ?? undefined,
        collapsedByDefault: rawConfig.collapsedByDefault ?? undefined
    });

    const effectiveTitleSource = rawConfig.titleSource ?? folderTitleSource;

    const contents = await buildNavigationForDirectory({
        directoryPath: folderPath,
        titleSource: effectiveTitleSource
    });

    const indexPage = contents.find(
        (item) =>
            item.type === "page" &&
            (item.slug === "index" ||
                item.absolutePath.toLowerCase().endsWith("/index.mdx") ||
                item.absolutePath.toLowerCase().endsWith("/index.md"))
    );

    const filteredContents = indexPage ? contents.filter((item) => item !== indexPage) : contents;

    const folderName = path.basename(folderPath);
    const indexFrontmatterTitle =
        effectiveTitleSource === "frontmatter" && indexPage?.type === "page"
            ? (await getFrontmatterMetadata({ absolutePath: indexPage.absolutePath })).title
            : undefined;
    const title = rawConfig.title ?? indexFrontmatterTitle ?? nameToTitle({ name: folderName });
    const slug = rawConfig.slug ?? nameToSlug({ name: folderName });

    return {
        type: "section",
        title,
        icon: resolveIconPath(rawConfig.icon, absolutePathToConfig),
        contents: filteredContents,
        slug,
        collapsed: rawConfig.collapsed ?? undefined,
        collapsible: rawConfig.collapsible ?? undefined,
        collapsedByDefault: rawConfig.collapsedByDefault ?? undefined,
        hidden: rawConfig.hidden ?? undefined,
        skipUrlSlug: rawConfig.skipSlug ?? false,
        overviewAbsolutePath: indexPage?.type === "page" ? indexPage.absolutePath : undefined,
        viewers: parseRoles(rawConfig.viewers),
        orphaned: rawConfig.orphaned,
        featureFlags: convertFeatureFlag(rawConfig.featureFlag),
        availability: rawConfig.availability
    };
}

async function convertNavigationItem({
    rawConfig,
    absolutePathToFernFolder,
    absolutePathToConfig,
    context,
    folderTitleSource
}: {
    rawConfig: docsYml.RawSchemas.NavigationItem;
    absolutePathToFernFolder: AbsoluteFilePath;
    absolutePathToConfig: AbsoluteFilePath;
    context: TaskContext;
    folderTitleSource?: docsYml.RawSchemas.TitleSource;
}): Promise<docsYml.DocsNavigationItem> {
    if (isRawPageConfig(rawConfig)) {
        return parsePageConfig(rawConfig, absolutePathToConfig);
    }
    if (isRawSectionConfig(rawConfig)) {
        validateCollapsibleConfig({
            context,
            sectionTitle: rawConfig.section,
            collapsed: rawConfig.collapsed ?? undefined,
            collapsible: rawConfig.collapsible ?? undefined,
            collapsedByDefault: rawConfig.collapsedByDefault ?? undefined
        });
        return {
            type: "section",
            title: rawConfig.section,
            icon: resolveIconPath(rawConfig.icon, absolutePathToConfig),
            contents: await Promise.all(
                rawConfig.contents.map((item) =>
                    convertNavigationItem({
                        rawConfig: item,
                        absolutePathToFernFolder,
                        absolutePathToConfig,
                        context,
                        folderTitleSource
                    })
                )
            ),
            slug: rawConfig.slug ?? undefined,
            collapsed: rawConfig.collapsed ?? undefined,
            collapsible: rawConfig.collapsible ?? undefined,
            collapsedByDefault: rawConfig.collapsedByDefault ?? undefined,
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
            icon: resolveIconPath(rawConfig.icon, absolutePathToConfig),
            apiName: rawConfig.apiName ?? undefined,
            audiences:
                rawConfig.audiences != null
                    ? { type: "select", audiences: parseAudiences(rawConfig.audiences) ?? [] }
                    : { type: "all" },
            availability: rawConfig.availability,
            showErrors: rawConfig.displayErrors ?? true,
            tagDescriptionPages: rawConfig.tagDescriptionPages ?? false,
            snippetsConfiguration:
                rawConfig.snippets != null
                    ? convertSnippetsConfiguration({ rawConfig: rawConfig.snippets })
                    : undefined,
            postman: rawConfig.postman,
            navigation:
                rawConfig.layout?.flatMap((item) => parseApiReferenceLayoutItem(item, absolutePathToConfig, context)) ??
                [],
            overviewAbsolutePath: resolveFilepath(rawConfig.summary, absolutePathToConfig),
            collapsed: rawConfig.collapsed ?? undefined,
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
            icon: resolveIconPath(rawConfig.icon, absolutePathToConfig),
            target: rawConfig.target
        };
    }
    if (isRawChangelogConfig(rawConfig)) {
        return {
            type: "changelog",
            changelog: await listFiles(resolveFilepath(rawConfig.changelog, absolutePathToConfig), "{md,mdx}"),
            hidden: rawConfig.hidden ?? false,
            icon: resolveIconPath(rawConfig.icon, absolutePathToConfig),
            title: rawConfig.title ?? DEFAULT_CHANGELOG_TITLE,
            slug: rawConfig.slug,
            viewers: parseRoles(rawConfig.viewers),
            orphaned: rawConfig.orphaned,
            featureFlags: convertFeatureFlag(rawConfig.featureFlag)
        };
    }
    if (isRawFolderConfig(rawConfig)) {
        return await expandFolderConfiguration({
            rawConfig,
            absolutePathToFernFolder,
            absolutePathToConfig,
            context,
            folderTitleSource
        });
    }
    if (isRawLibraryReferenceConfig(rawConfig)) {
        return {
            type: "librarySection",
            libraryName: rawConfig.library,
            title: rawConfig.title ?? undefined,
            slug: rawConfig.slug ?? undefined,
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
        icon: resolveIconPath(item.icon, absolutePathToConfig),
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
    absolutePathToConfig: AbsoluteFilePath,
    context?: TaskContext
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
                icon: resolveIconPath(item.icon, absolutePathToConfig),
                target: item.target
            }
        ];
    } else if (isRawApiRefSectionConfiguration(item)) {
        if (context != null) {
            validateCollapsibleConfig({
                context,
                sectionTitle: item.section,
                collapsed: item.collapsed ?? undefined,
                collapsible: item.collapsible ?? undefined,
                collapsedByDefault: item.collapsedByDefault ?? undefined
            });
        }
        return [
            {
                type: "section",
                title: item.section,
                referencedSubpackages: item.referencedPackages ?? [],
                overviewAbsolutePath: resolveFilepath(item.summary, absolutePathToConfig),
                contents:
                    item.contents?.flatMap((value) =>
                        parseApiReferenceLayoutItem(value, absolutePathToConfig, context)
                    ) ?? [],
                slug: item.slug,
                hidden: item.hidden,
                skipUrlSlug: item.skipSlug,
                collapsed: item.collapsed ?? undefined,
                collapsible: item.collapsible ?? undefined,
                collapsedByDefault: item.collapsedByDefault ?? undefined,
                availability: item.availability,
                icon: resolveIconPath(item.icon, absolutePathToConfig),
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
                icon: resolveIconPath(item.icon, absolutePathToConfig),
                slug: item.slug,
                hidden: item.hidden,
                availability: item.availability,
                playground: item.playground,
                viewers: parseRoles(item.viewers),
                orphaned: item.orphaned,
                featureFlags: convertFeatureFlag(item.featureFlag)
            }
        ];
    } else if (isRawApiRefOperationConfiguration(item)) {
        return [
            {
                type: "operation",
                operation: item.operation,
                title: item.title,
                slug: item.slug,
                hidden: item.hidden,
                availability: item.availability,
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
                    value.contents?.flatMap((value) =>
                        parseApiReferenceLayoutItem(value, absolutePathToConfig, context)
                    ) ?? [],
                slug: value.slug,
                hidden: value.hidden,
                skipUrlSlug: value.skipSlug,
                icon: resolveIconPath(value.icon, absolutePathToConfig),
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
            contents: value.flatMap((value) => parseApiReferenceLayoutItem(value, absolutePathToConfig, context)),
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

function isRawFolderConfig(item: unknown): item is docsYml.RawSchemas.FolderConfiguration {
    return isPlainObject(item) && typeof item.folder === "string";
}

function isRawLibraryReferenceConfig(item: unknown): item is docsYml.RawSchemas.LibraryReferenceConfiguration {
    return isPlainObject(item) && typeof item.library === "string";
}

function isGitLibraryInput(
    input: docsYml.RawSchemas.LibraryInputConfiguration
): input is docsYml.RawSchemas.GitLibraryInputSchema {
    return "git" in input;
}

function parseLibrariesConfiguration(
    libraries: Record<string, docsYml.RawSchemas.LibraryConfiguration> | undefined
): Record<string, docsYml.ParsedLibraryConfiguration> | undefined {
    if (libraries == null) {
        return undefined;
    }
    const result: Record<string, docsYml.ParsedLibraryConfiguration> = {};
    for (const [name, config] of Object.entries(libraries)) {
        if (!isGitLibraryInput(config.input)) {
            throw new CliError({
                message: `Library '${name}' uses 'path' input which is not yet supported. Please use 'git' input.`,
                code: CliError.Code.ConfigError
            });
        }
        result[name] = {
            input: {
                git: config.input.git,
                subpath: config.input.subpath
            },
            output: {
                path: config.output.path
            },
            lang: config.lang
        };
    }
    return result;
}

function isRawApiRefSectionConfiguration(item: unknown): item is docsYml.RawSchemas.ApiReferenceSectionConfiguration {
    return isPlainObject(item) && typeof item.section === "string" && Array.isArray(item.contents);
}

function isRawApiRefEndpointConfiguration(item: unknown): item is docsYml.RawSchemas.ApiReferenceEndpointConfiguration {
    return isPlainObject(item) && typeof item.endpoint === "string";
}

function isRawApiRefOperationConfiguration(
    item: unknown
): item is docsYml.RawSchemas.ApiReferenceOperationConfiguration {
    return isPlainObject(item) && typeof item.operation === "string";
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
    navbarLinks: docsYml.RawSchemas.NavbarLink[] | undefined,
    absoluteFilepathToDocsConfig: AbsoluteFilePath
): CjsFdrSdk.docs.v1.commons.NavbarLink[] | undefined {
    return navbarLinks?.map((navbarLink): WithoutQuestionMarks<CjsFdrSdk.docs.v1.commons.NavbarLink> => {
        if (navbarLink.type === "github") {
            // Handle GitHub navbar links specially as they have a different structure
            const githubValue = navbarLink.value;
            if (typeof githubValue === "string") {
                return {
                    type: "github",
                    url: CjsFdrSdk.Url(githubValue),
                    viewers: undefined,
                    target: undefined
                };
            } else {
                return {
                    type: "github",
                    url: CjsFdrSdk.Url(githubValue.url),
                    viewers: convertRoleToRoleIds(githubValue.viewers),
                    target: githubValue.target
                };
            }
        }

        const viewers = convertRoleToRoleIds(navbarLink.viewers);

        if (navbarLink.type === "dropdown") {
            return {
                type: "dropdown",
                text: navbarLink.text,
                icon: resolveIconPath(navbarLink.icon, absoluteFilepathToDocsConfig),
                rightIcon: resolveIconPath(navbarLink.rightIcon, absoluteFilepathToDocsConfig),
                rounded: navbarLink.rounded,
                viewers,
                links:
                    navbarLink.links?.map((link) => ({
                        href: link.href,
                        target: link.target,
                        url: CjsFdrSdk.Url(link.url ?? link.href ?? "/"),
                        text: link.text,
                        icon: resolveIconPath(link.icon, absoluteFilepathToDocsConfig),
                        rightIcon: resolveIconPath(link.rightIcon, absoluteFilepathToDocsConfig),
                        rounded: link.rounded,
                        viewers: convertRoleToRoleIds(link.viewers)
                    })) ?? []
            };
        }

        return {
            type: navbarLink.type,
            text: navbarLink.text,
            url: CjsFdrSdk.Url(navbarLink.href ?? navbarLink.url ?? "/"),
            target: navbarLink.target,
            icon: resolveIconPath(navbarLink.icon, absoluteFilepathToDocsConfig),
            rightIcon: resolveIconPath(navbarLink.rightIcon, absoluteFilepathToDocsConfig),
            rounded: navbarLink.rounded,
            viewers
        };
    });
}

function convertRoleToRoleIds(
    role: docsYml.RawSchemas.Role | undefined
): CjsFdrSdk.docs.v1.commons.RoleId[] | undefined {
    if (role == null) {
        return undefined;
    }
    if (Array.isArray(role)) {
        return role.map((r) => CjsFdrSdk.docs.v1.commons.RoleId(r));
    }
    return [CjsFdrSdk.docs.v1.commons.RoleId(role)];
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
    absoluteFilepathToDocsConfig: AbsoluteFilePath,
    context: TaskContext
): Promise<docsYml.ParsedMetadataConfig | undefined> {
    if (metadata == null) {
        return undefined;
    }

    warnOnMetadataConflicts(metadata, context);

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
        "og:dynamic": metadata.ogDynamic,
        "og:background-image": await convertFilepathOrUrl(metadata.ogBackgroundImage, absoluteFilepathToDocsConfig),
        "og:dynamic:text-color": metadata.ogDynamicTextColor,
        "og:dynamic:background-color": metadata.ogDynamicBackgroundColor,
        "og:dynamic:logo-color": metadata.ogDynamicLogoColor,
        "og:dynamic:show-logo": metadata.ogDynamicShowLogo,
        "og:dynamic:show-section": metadata.ogDynamicShowSection,
        "og:dynamic:show-description": metadata.ogDynamicShowDescription,
        "og:dynamic:show-url": metadata.ogDynamicShowUrl,
        "og:dynamic:show-gradient": metadata.ogDynamicShowGradient,
        nofollow: undefined,
        noindex: undefined,
        canonicalHost: metadata.canonicalHost
    };
}

/**
 * Emits non-fatal warnings when metadata settings in docs.yml interact in
 * ways that silently discard user intent (e.g. `og:image` being ignored on
 * non-homepage routes when `og:dynamic` is enabled).
 *
 * See seo.ts and og/route.tsx in fern-platform for the runtime behavior
 * these warnings describe.
 */
function warnOnMetadataConflicts(metadata: docsYml.RawSchemas.MetadataConfig, context: TaskContext): void {
    const dynamicEnabled = metadata.ogDynamic === true;

    const dynamicSettings: Array<[string, unknown]> = [
        ["og:background-image", metadata.ogBackgroundImage],
        ["og:dynamic:text-color", metadata.ogDynamicTextColor],
        ["og:dynamic:background-color", metadata.ogDynamicBackgroundColor],
        ["og:dynamic:logo-color", metadata.ogDynamicLogoColor],
        ["og:dynamic:show-logo", metadata.ogDynamicShowLogo],
        ["og:dynamic:show-section", metadata.ogDynamicShowSection],
        ["og:dynamic:show-description", metadata.ogDynamicShowDescription],
        ["og:dynamic:show-url", metadata.ogDynamicShowUrl],
        ["og:dynamic:show-gradient", metadata.ogDynamicShowGradient]
    ];

    // 1 + 2: og:dynamic overrides og:image / twitter:image on non-home pages
    if (dynamicEnabled && metadata.ogImage != null) {
        context.logger.warn(
            "[metadata] `og:image` is only applied to the homepage when `og:dynamic: true`. All other pages show the dynamically generated image. Remove `og:image` to rely entirely on dynamic generation, or set `og:dynamic: false` to use `og:image` site-wide."
        );
    }
    if (dynamicEnabled && metadata.twitterImage != null) {
        context.logger.warn(
            "[metadata] `twitter:image` is only applied to the homepage when `og:dynamic: true`. All other pages show the dynamically generated image."
        );
    }

    // 3: og:dynamic sub-settings require og:dynamic: true
    if (!dynamicEnabled) {
        const ignored = dynamicSettings.filter(([, value]) => value != null).map(([key]) => key);
        if (ignored.length > 0) {
            context.logger.warn(
                `[metadata] The following settings require \`og:dynamic: true\` and will be ignored: ${ignored
                    .map((k) => `\`${k}\``)
                    .join(", ")}.`
            );
        }
    }

    // 4: logo-color is meaningless when logo is hidden
    if (dynamicEnabled && metadata.ogDynamicShowLogo === false && metadata.ogDynamicLogoColor != null) {
        context.logger.warn(
            "[metadata] `og:dynamic:logo-color` has no effect because `og:dynamic:show-logo: false`. Remove one or the other."
        );
    }

    // 5: orphan og:image dimensions
    if (metadata.ogImage == null && (metadata.ogImageWidth != null || metadata.ogImageHeight != null)) {
        context.logger.warn("[metadata] `og:image:width` / `og:image:height` have no effect without `og:image`.");
    }

    // 6: text-color and background-color identical would make text invisible
    if (
        dynamicEnabled &&
        typeof metadata.ogDynamicTextColor === "string" &&
        typeof metadata.ogDynamicBackgroundColor === "string" &&
        metadata.ogDynamicTextColor.trim().toLowerCase() === metadata.ogDynamicBackgroundColor.trim().toLowerCase()
    ) {
        context.logger.warn(
            `[metadata] \`og:dynamic:text-color\` and \`og:dynamic:background-color\` are both set to \`${metadata.ogDynamicTextColor}\`, which will make text invisible in generated OG images.`
        );
    }
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

function parseRoles(raw: string | string[] | undefined): CjsFdrSdk.docs.v1.commons.RoleId[] | undefined {
    if (raw == null) {
        return undefined;
    }

    if (typeof raw === "string") {
        return [CjsFdrSdk.docs.v1.commons.RoleId(raw)];
    }

    if (raw.length === 0) {
        return undefined;
    }

    return raw.map(CjsFdrSdk.docs.v1.commons.RoleId);
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

function validateCollapsibleConfig({
    context,
    sectionTitle,
    collapsed,
    collapsible,
    collapsedByDefault
}: {
    context: TaskContext;
    sectionTitle: string;
    collapsed: boolean | "open-by-default" | undefined;
    collapsible: boolean | undefined;
    collapsedByDefault: boolean | undefined;
}): void {
    if (collapsible != null && collapsed != null) {
        context.failAndThrow(
            `Section "${sectionTitle}": cannot use both "collapsible" and the deprecated "collapsed" property. ` +
                `Please use "collapsible" and "collapsed-by-default" instead.`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }

    if (collapsedByDefault != null && collapsible !== true) {
        context.failAndThrow(
            `Section "${sectionTitle}": "collapsed-by-default" requires "collapsible: true". ` +
                `"collapsed-by-default" has no effect on a non-collapsible section.`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
}
