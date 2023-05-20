import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath, dirname, resolve } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { FernDocsConfig as RawDocs } from "@fern-fern/docs-config";
import {
    ColorsConfiguration,
    DocsConfiguration,
    DocsNavigationConfiguration,
    DocsNavigationItem,
    LogoReference,
} from "./DocsConfiguration";

export async function convertDocsConfiguration({
    rawDocsConfiguration,
    absolutePathOfConfiguration,
}: {
    rawDocsConfiguration: RawDocs.DocsConfiguration;
    absolutePathOfConfiguration: AbsoluteFilePath;
    context: TaskContext;
}): Promise<DocsConfiguration> {
    return {
        navigation: convertNavigationConfiguration(rawDocsConfiguration.navigation, absolutePathOfConfiguration),
        logo:
            rawDocsConfiguration.logo != null
                ? convertLogoReference(rawDocsConfiguration.logo, absolutePathOfConfiguration)
                : undefined,
        colors: convertColorsConfiguration(rawDocsConfiguration.colors),
    };
}

function convertNavigationConfiguration(
    rawConfig: RawDocs.NavigationItem[],
    absolutePathOfConfiguration: AbsoluteFilePath
): DocsNavigationConfiguration {
    return {
        items: rawConfig.map((item) => convertNavigationItem(item, absolutePathOfConfiguration)),
    };
}

function convertNavigationItem(
    rawConfig: RawDocs.NavigationItem,
    absolutePathOfConfiguration: AbsoluteFilePath
): DocsNavigationItem {
    if (isRawPageConfig(rawConfig)) {
        return {
            type: "page",
            title: rawConfig.page,
            absolutePath: resolve(dirname(absolutePathOfConfiguration), rawConfig.path),
        };
    }
    if (isRawSectionConfig(rawConfig)) {
        return {
            type: "section",
            title: rawConfig.section,
            contents: rawConfig.contents.map((item) => convertNavigationItem(item, absolutePathOfConfiguration)),
        };
    }
    if (isRawApiSectionConfig(rawConfig)) {
        return {
            type: "apiSection",
            title: rawConfig.api,
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

function convertLogoReference(rawLogoReference: string, absolutePathOfConfiguration: AbsoluteFilePath): LogoReference {
    if (rawLogoReference.startsWith("http")) {
        return {
            type: "url",
            url: rawLogoReference,
        };
    } else {
        return {
            type: "file",
            filepath: resolve(dirname(absolutePathOfConfiguration), rawLogoReference),
        };
    }
}

function convertColorsConfiguration(_rawConfig: RawDocs.ColorsConfiguration): ColorsConfiguration {
    return {};
}
