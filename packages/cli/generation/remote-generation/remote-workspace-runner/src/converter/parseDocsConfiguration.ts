import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath, dirname, resolve } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { FernDocsConfig as RawDocs } from "@fern-fern/docs-config";
import { NavigationConfig, VersionConfig } from "@fern-fern/docs-config/api";
import { VersionFileConfig as RawVersionFileConfigSerializer } from "@fern-fern/docs-config/serialization";
import { FernRegistry } from "@fern-fern/registry-node";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { getAllPages } from "./getAllPages";
import {
    DocsNavigationConfiguration,
    DocsNavigationItem,
    FontConfig,
    ImageReference,
    ParsedDocsConfiguration,
    TabbedDocsNavigation,
    TypographyConfig,
    UntabbedDocsNavigation,
    VersionInfo,
} from "./ParsedDocsConfiguration";
export async function parseDocsConfiguration({
    rawDocsConfiguration,
    absolutePathToFernFolder,
    absoluteFilepathToDocsConfig,
    context,
}: {
    rawDocsConfiguration: RawDocs.DocsConfiguration;
    absolutePathToFernFolder: AbsoluteFilePath;
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
    context: TaskContext;
}): Promise<ParsedDocsConfiguration> {
    const {
        instances,
        navigation,
        colors,
        favicon,
        backgroundImage,
        logo,
        navbarLinks,
        title,
        typography,
        tabs,
        versions,
    } = rawDocsConfiguration;
    const convertedColors = convertColorsConfiguration(colors ?? {}, context);

    const convertedNavigation = await getNavigationConfiguration({
        versions,
        navigation,
        absolutePathToFernFolder,
        absolutePathToConfig: absoluteFilepathToDocsConfig,
        context,
    });

    return {
        instances,
        absoluteFilepath: absoluteFilepathToDocsConfig,
        pages: await getAllPages({ navigation: convertedNavigation, absolutePathToFernFolder }),
        navigation: convertedNavigation,
        title,
        tabs,
        logo:
            logo != null
                ? {
                      dark:
                          logo.dark != null
                              ? await convertImageReference({
                                    rawImageReference: logo.dark,
                                    absoluteFilepathToDocsConfig,
                                })
                              : undefined,
                      light:
                          logo.light != null
                              ? await convertImageReference({
                                    rawImageReference: logo.light,
                                    absoluteFilepathToDocsConfig,
                                })
                              : undefined,
                      height: logo.height,
                      href: logo.href != null ? FernRegistry.docs.v1.write.Url(logo.href) : undefined,
                  }
                : undefined,
        favicon:
            favicon != null
                ? await convertImageReference({ rawImageReference: favicon, absoluteFilepathToDocsConfig })
                : undefined,
        backgroundImage:
            backgroundImage != null
                ? await convertImageReference({
                      rawImageReference: backgroundImage,
                      absoluteFilepathToDocsConfig,
                  })
                : undefined,
        colors: {
            accentPrimary:
                convertedColors.accentPrimary != null
                    ? convertedColors.accentPrimary.type === "themed"
                        ? {
                              type: "themed",
                              dark: convertedColors.accentPrimary.dark,
                              light: convertedColors.accentPrimary.light,
                          }
                        : convertedColors.accentPrimary.type === "unthemed"
                        ? {
                              type: "unthemed",
                              color: convertedColors.accentPrimary.color,
                          }
                        : undefined
                    : undefined,
            background:
                convertedColors.background != null
                    ? convertedColors.background.type === "themed"
                        ? {
                              type: "themed",
                              dark: convertedColors.background.dark,
                              light: convertedColors.background.light,
                          }
                        : convertedColors.background.type === "unthemed"
                        ? {
                              type: "unthemed",
                              color: convertedColors.background.color,
                          }
                        : undefined
                    : undefined,
        },
        navbarLinks: navbarLinks != null ? convertNavbarLinks(navbarLinks) : undefined,
        typography:
            typography != null
                ? await convertTypographyConfiguration({
                      rawTypography: typography,
                      absoluteFilepathToDocsConfig,
                  })
                : undefined,
    };
}

async function getNavigationConfiguration({
    versions,
    navigation,
    absolutePathToFernFolder,
    absolutePathToConfig,
    context,
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
            context,
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
                context,
            });
            versionedNavbars.push({
                version: version.displayName,
                navigation,
                availability: version.availability,
                slug: version.slug,
            });
        }
        return {
            type: "versioned",
            versions: versionedNavbars,
        };
    }
    throw new Error("Unexpected. Docs have neither navigation or versions defined.");
}

async function convertTypographyConfiguration({
    rawTypography,
    absoluteFilepathToDocsConfig,
}: {
    rawTypography: RawDocs.DocsTypographyConfig;
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
}): Promise<TypographyConfig> {
    return {
        headingsFont:
            rawTypography.headingsFont != null
                ? await convertFontConfig({
                      rawFontConfig: rawTypography.headingsFont,
                      absoluteFilepathToDocsConfig,
                  })
                : undefined,
        bodyFont:
            rawTypography.bodyFont != null
                ? await convertFontConfig({
                      rawFontConfig: rawTypography.bodyFont,
                      absoluteFilepathToDocsConfig,
                  })
                : undefined,
        codeFont:
            rawTypography.codeFont != null
                ? await convertFontConfig({
                      rawFontConfig: rawTypography.codeFont,
                      absoluteFilepathToDocsConfig,
                  })
                : undefined,
    };
}

async function convertFontConfig({
    rawFontConfig,
    absoluteFilepathToDocsConfig,
}: {
    rawFontConfig: RawDocs.FontConfig;
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
}): Promise<FontConfig> {
    return {
        name: rawFontConfig.name,
        absolutePath: await resolveFilepath({
            absolutePath: absoluteFilepathToDocsConfig,
            rawUnresolvedFilepath: rawFontConfig.path,
        }),
    };
}

async function convertNavigationConfiguration({
    rawNavigationConfig,
    absolutePathToFernFolder,
    absolutePathToConfig,
    context,
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
                            context,
                        })
                    )
                );
                return {
                    tab: item.tab,
                    layout,
                };
            })
        );
        return {
            type: "tabbed",
            items: tabbedNavigationItems,
        };
    } else {
        return {
            type: "untabbed",
            items: await Promise.all(
                rawNavigationConfig.map((item) =>
                    convertNavigationItem({ rawConfig: item, absolutePathToFernFolder, absolutePathToConfig, context })
                )
            ),
        };
    }
}

async function convertNavigationItem({
    rawConfig,
    absolutePathToFernFolder,
    absolutePathToConfig,
    context,
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
                rawUnresolvedFilepath: rawConfig.path,
            }),
            slug: rawConfig.slug ?? undefined,
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
            collapsed: rawConfig.collapsed ?? undefined,
        };
    }
    if (isRawApiSectionConfig(rawConfig)) {
        return {
            type: "apiSection",
            title: rawConfig.api,
            apiName: rawConfig.apiName ?? undefined,
            audiences:
                rawConfig.audiences != null ? { type: "select", audiences: rawConfig.audiences } : { type: "all" },
        };
    }
    assertNever(rawConfig);
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

async function convertImageReference({
    rawImageReference,
    absoluteFilepathToDocsConfig,
}: {
    rawImageReference: string;
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
}): Promise<ImageReference> {
    return {
        filepath: await resolveFilepath({
            absolutePath: absoluteFilepathToDocsConfig,
            rawUnresolvedFilepath: rawImageReference,
        }),
    };
}

function convertColorsConfiguration(
    rawConfig: RawDocs.ColorsConfiguration,
    context: TaskContext
): FernRegistry.docs.v1.write.ColorsConfigV2 {
    return {
        accentPrimary:
            rawConfig.accentPrimary != null
                ? convertColorConfiguration(rawConfig.accentPrimary, context, "accentPrimary")
                : undefined,
        background:
            rawConfig.background != null
                ? convertColorConfiguration(rawConfig.background, context, "background")
                : undefined,
    };
}

function convertColorConfiguration(
    raw: RawDocs.ColorConfig,
    context: TaskContext,
    key: string
): FernRegistry.docs.v1.write.ColorConfig {
    if (typeof raw === "string") {
        const rgb = hexToRgb(raw);
        if (rgb == null) {
            context.failAndThrow(`'${key}' should be a hex color of the format #FFFFFF`);
        }
        return FernRegistry.docs.v1.write.ColorConfig.unthemed({
            color: rgb,
        });
    }

    let rgbDark = undefined;
    let rgbLight = undefined;

    if (raw.dark != null) {
        const rgb = hexToRgb(raw.dark);
        if (rgb == null) {
            context.failAndThrow(`'${key}.dark' should be a hex color of the format #FFFFFF`);
        }
        rgbDark = rgb;
    }

    if (raw.light != null) {
        const rgb = hexToRgb(raw.light);
        if (rgb == null) {
            context.failAndThrow(`'${key}.light' should be a hex color of the format #FFFFFF`);
        }
        rgbLight = rgb;
    }

    return FernRegistry.docs.v1.write.ColorConfig.themed({
        dark: rgbDark,
        light: rgbLight,
    });
}

const HEX_COLOR_REGEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

// https://stackoverflow.com/a/5624139/4238485
function hexToRgb(hexString: string): FernRegistry.docs.v1.write.RgbColor | undefined {
    const result = HEX_COLOR_REGEX.exec(hexString);
    if (result != null) {
        const [_, rAsString, gAsString, bAsString] = result;
        const r = parseHexColorCode(rAsString);
        const g = parseHexColorCode(gAsString);
        const b = parseHexColorCode(bAsString);
        if (r != null && g != null && b != null) {
            return { r, g, b };
        }
    }
    return undefined;
}

function parseHexColorCode(value: string | undefined): number | undefined {
    if (value == null) {
        return undefined;
    }
    const valueAsNumber = parseInt(value, 16);
    if (isNaN(valueAsNumber)) {
        return undefined;
    }
    return valueAsNumber;
}

function convertNavbarLinks(rawConfig: RawDocs.NavbarLink[]): FernRegistry.docs.v1.write.NavbarLink[] {
    return rawConfig.map((rawNavbarLink) => {
        switch (rawNavbarLink.type) {
            case "primary":
                return FernRegistry.docs.v1.write.NavbarLink.primary({
                    text: rawNavbarLink.text,
                    url: rawNavbarLink.url,
                });
            case "secondary":
                return FernRegistry.docs.v1.write.NavbarLink.secondary({
                    text: rawNavbarLink.text,
                    url: rawNavbarLink.url,
                });
            default:
                assertNever(rawNavbarLink);
        }
    });
}

async function resolveFilepath({
    rawUnresolvedFilepath,
    absolutePath,
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
