import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { SidebarItemId } from "./SidebarItemId";

export interface SidebarItemIdGenerator {
    readonly API_CONFIGURATION: SidebarItemId;
    readonly SDKs: SidebarItemId;
    readonly package: (packageId: FernApiEditor.PackageId) => SidebarItemId;
    readonly endpoint: (endpointId: FernApiEditor.EndpointId) => SidebarItemId;
    readonly types: (packageId: FernApiEditor.PackageId) => SidebarItemId;
    readonly type: (typeId: FernApiEditor.TypeId) => SidebarItemId;
    readonly errors: (packageId: FernApiEditor.PackageId) => SidebarItemId;
    readonly error: (errorId: FernApiEditor.ErrorId) => SidebarItemId;
}

export const SidebarItemIdGenerator: SidebarItemIdGenerator = {
    API_CONFIGURATION: { type: "apiConfiguration" },
    SDKs: { type: "sdkConfiguration" },
    package: (packageId) => ({ type: "editorItem", editorItemId: packageId }),
    endpoint: (endpointId) => ({ type: "editorItem", editorItemId: endpointId }),
    types: (packageId) => ({ type: "editorTypesGroup", packageId }),
    type: (typeId) => ({ type: "editorItem", editorItemId: typeId }),
    errors: (packageId) => ({ type: "editorErrorsGroup", packageId }),
    error: (errorId) => ({ type: "editorItem", editorItemId: errorId }),
};
