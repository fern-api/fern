import { StaticSidebarItemIdParser } from "../types";

export interface ParsedApiConfigurationSidebarItem {
    type: "apiConfiguration";
}

export const ApiConfigurationSidebarItemParser: StaticSidebarItemIdParser<"config", ParsedApiConfigurationSidebarItem> =
    {
        type: "static",
        id: "config",
        parsed: {
            type: "apiConfiguration",
        },
    };
