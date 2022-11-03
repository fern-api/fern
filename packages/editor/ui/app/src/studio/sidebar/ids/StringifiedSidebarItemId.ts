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
            case "package":
            case "typesGroup":
            case "errorsGroup":
                return `${sidebarItemId.type}.${sidebarItemId.packageId}` as StringifiedSidebarItemId;
            case "endpoint":
                return `${sidebarItemId.type}.${sidebarItemId.endpointId}` as StringifiedSidebarItemId;
            case "type":
                return `${sidebarItemId.type}.${sidebarItemId.typeId}` as StringifiedSidebarItemId;
            case "error":
                return `${sidebarItemId.type}.${sidebarItemId.errorId}` as StringifiedSidebarItemId;
            default:
                assertNever(sidebarItemId);
        }
    },
};
