import { assertNever } from "@fern-api/core-utils";
import { SidebarItemId } from "./SidebarItemId";

export type StringifiedSidebarItemId = string & {
    __StringifiedSidebarItemId: void;
};

export const StringifiedSidebarItemId = {
    stringify: (sidebarItemId: SidebarItemId): StringifiedSidebarItemId => {
        switch (sidebarItemId.type) {
            case "apiConfiguration":
            case "sdkConfiguration":
                return sidebarItemId.type as StringifiedSidebarItemId;
            case "editorItem":
                return `${sidebarItemId.type}.${sidebarItemId.editorItemId}` as StringifiedSidebarItemId;
            case "editorTypesGroup":
            case "editorErrorsGroup":
                return `${sidebarItemId.type}.${sidebarItemId.packageId}` as StringifiedSidebarItemId;
            default:
                assertNever(sidebarItemId);
        }
    },
};
