import { assertNever, values } from "@fern-api/core-utils";
import { ApiConfigurationSidebarItemParser, ParsedApiConfigurationSidebarItem } from "./items/apiConfiguration";
import { PackageSidebarItemParser, ParsedPackageSidebarItem } from "./items/package";
import { ParsedSdkConfigurationSidebarItem, SdksConfigurationSidebarItemParser } from "./items/sdkConfiguration";
import { SidebarItemId } from "./types";

const SidebarItemIds = {
    api: ApiConfigurationSidebarItemParser,
    sdks: SdksConfigurationSidebarItemParser,
    package: PackageSidebarItemParser,
};

type ParsedSidebarItem =
    | ParsedApiConfigurationSidebarItem
    | ParsedSdkConfigurationSidebarItem
    | ParsedPackageSidebarItem;

export function parseSidebarItemId(sidebarItemId: SidebarItemId): ParsedSidebarItem {
    for (const parser of values(SidebarItemIds)) {
        if (parser.type === "static") {
            if (sidebarItemId === parser.id) {
                return parser.parsed;
            }
        } else if (parser.type === "dynamic") {
            const maybeParsed = parser.parse(sidebarItemId);
            if (maybeParsed != null) {
                return maybeParsed;
            }
        } else {
            assertNever(parser);
        }
    }

    throw new Error("Failed to parse sidebar item ID: " + sidebarItemId);
}
