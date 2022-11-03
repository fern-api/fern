import { StaticSidebarItemIdParser } from "../types";

export interface ParsedSdkConfigurationSidebarItem {
    type: "sdkConfiguration";
}

export const SdksConfigurationSidebarItemParser: StaticSidebarItemIdParser<"sdks", ParsedSdkConfigurationSidebarItem> =
    {
        type: "static",
        id: "sdks",
        parsed: {
            type: "sdkConfiguration",
        },
    };
