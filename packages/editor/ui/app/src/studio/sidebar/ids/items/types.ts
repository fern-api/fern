import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { DynamicSidebarItemIdParser, SidebarItemId } from "../types";

const PACKAGE_ID_SIDEBAR_ITEM_ID_PREFIX = "package.";
const PACKAGE_ID_SIDEBAR_ITEM_ID_REGEX = new RegExp(`${PACKAGE_ID_SIDEBAR_ITEM_ID_PREFIX}(.*)`);

export interface ParsedPackageSidebarItem {
    type: "package";
    packageId: FernApiEditor.PackageId;
}

export const PackageSidebarItemParser: DynamicSidebarItemIdParser<FernApiEditor.PackageId, ParsedPackageSidebarItem> = {
    type: "dynamic",
    construct: (packageId: FernApiEditor.PackageId) =>
        `${PACKAGE_ID_SIDEBAR_ITEM_ID_PREFIX}${packageId}` as SidebarItemId,
    parse: (sidebarItemId) => {
        const match = sidebarItemId.match(PACKAGE_ID_SIDEBAR_ITEM_ID_REGEX);
        const packageId = match?.[2];
        if (packageId == null) {
            return undefined;
        }
        return {
            type: "package",
            packageId,
        };
    },
};
