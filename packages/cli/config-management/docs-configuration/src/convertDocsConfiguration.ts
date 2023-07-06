import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath, dirname, resolve } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { FernDocsConfig as RawDocs } from "@fern-fern/docs-config";
import { FernRegistry } from "@fern-fern/registry-node";
import {
    DocsConfiguration,
    DocsNavigationConfiguration,
    DocsNavigationItem,
    ImageReference,
} from "./DocsConfiguration";

export async function convertDocsConfiguration({
    rawDocsConfiguration,
    absolutePathOfConfiguration,
    context,
}: {
    rawDocsConfiguration: RawDocs.DocsConfiguration;
    absolutePathOfConfiguration: AbsoluteFilePath;
    context: TaskContext;
}): Promise<DocsConfiguration> {
    const { navigation, colors, favicon, logo, navbarLinks, title } = rawDocsConfiguration;
    return {
        navigation: convertNavigationConfiguration(navigation, absolutePathOfConfiguration),
        title,
        logo:
            logo != null
                ? convertImageReference(typeof logo === "string" ? logo : logo.path, absolutePathOfConfiguration)
                : undefined,
        favicon: favicon != null ? convertImageReference(favicon, absolutePathOfConfiguration) : undefined,
        colors: convertColorsConfiguration(colors ?? {}, context),
        navbarLinks: navbarLinks != null ? convertNavbarLinks(navbarLinks) : undefined,
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

function convertImageReference(
    rawImageReference: string,
    absolutePathOfConfiguration: AbsoluteFilePath
): ImageReference {
    return {
        filepath: resolve(dirname(absolutePathOfConfiguration), rawImageReference),
    };
}

function convertColorsConfiguration(
    rawConfig: RawDocs.ColorsConfiguration,
    context: TaskContext
): FernRegistry.docs.v1.write.ColorsConfig {
    return {
        accentPrimary: convertHextoRgb(rawConfig, "accentPrimary", context),
    };
}

const HEX_COLOR_REGEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

function convertHextoRgb(
    rawConfig: RawDocs.ColorsConfiguration,
    key: keyof RawDocs.ColorsConfiguration,
    context: TaskContext
): FernRegistry.docs.v1.write.RgbColor | undefined {
    const color = rawConfig[key];
    if (color == null) {
        return undefined;
    }
    const rgb = hexToRgb(color);
    if (rgb != null) {
        return rgb;
    }
    context.failAndThrow(`${key} should be a hex color of the format #FFFFFF`);
}

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
    return rawConfig.map((item) => {
        return {
            text: item.text,
            url: item.url,
            style: item.style != null ? convertNavbarLinkStyle(item.style) : undefined,
        };
    });
}

function convertNavbarLinkStyle(rawConfig: RawDocs.NavbarLinkStyle): FernRegistry.docs.v1.write.NavbarLinkStyle {
    switch (rawConfig) {
        case "primary":
            return FernRegistry.docs.v1.write.NavbarLinkStyle.Primary;
        default:
            assertNever(rawConfig);
    }
}
