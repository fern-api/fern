import { FernApiEditor } from "@fern-fern/api-editor-sdk";

export type SidebarItemId =
    | ApiConfigurationSidebarItemId
    | SdkConfigurationSidebarItemId
    | EditorItemSidebarItemId
    | EditorTypesGroupSidebarItemId
    | EditorErrorsGroupSidebarItemId;

export interface ApiConfigurationSidebarItemId {
    type: "apiConfiguration";
}

export interface SdkConfigurationSidebarItemId {
    type: "sdkConfiguration";
}

export interface EditorItemSidebarItemId {
    type: "editorItem";
    editorItemId: FernApiEditor.PackageId | FernApiEditor.EndpointId | FernApiEditor.TypeId | FernApiEditor.ErrorId;
}

export interface EditorTypesGroupSidebarItemId {
    type: "editorTypesGroup";
    packageId: FernApiEditor.PackageId;
}

export interface EditorErrorsGroupSidebarItemId {
    type: "editorErrorsGroup";
    packageId: FernApiEditor.PackageId;
}
