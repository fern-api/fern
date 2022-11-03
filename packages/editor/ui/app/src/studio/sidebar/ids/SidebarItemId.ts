import { FernApiEditor } from "@fern-fern/api-editor-sdk";

export type SidebarItemId =
    | ApiConfigurationSidebarItemId
    | SdkConfigurationSidebarItemId
    | PackageSidebarItemId
    | EndpointSidebarItemId
    | TypeSidebarItemId
    | ErrorSidebarItemId
    | TypesGroupSidebarItemId
    | ErrorsGroupSidebarItemId;

export interface ApiConfigurationSidebarItemId {
    type: "apiConfiguration";
}

export interface SdkConfigurationSidebarItemId {
    type: "sdkConfiguration";
}

export interface PackageSidebarItemId {
    type: "package";
    packageName?: string;
    packageId: FernApiEditor.PackageId;
}

export interface EndpointSidebarItemId {
    type: "endpoint";
    endpointName?: string;
    endpointId: FernApiEditor.EndpointId;
}

export interface TypeSidebarItemId {
    type: "type";
    typeName?: string;
    typeId: FernApiEditor.TypeId;
}

export interface ErrorSidebarItemId {
    type: "error";
    errorName?: string;
    errorId: FernApiEditor.ErrorId;
}

export interface TypesGroupSidebarItemId {
    type: "typesGroup";
    packageName?: string;
    packageId: FernApiEditor.PackageId;
}

export interface ErrorsGroupSidebarItemId {
    type: "errorsGroup";
    packageName?: string;
    packageId: FernApiEditor.PackageId;
}
