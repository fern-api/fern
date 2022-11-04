import { FernApiEditor } from "@fern-fern/api-editor-sdk";

export type SidebarItemId =
    | ApiConfigurationSidebarItemId
    | SdkConfigurationSidebarItemId
    | PackageSidebarItemId
    | EndpointSidebarItemId
    | TypeSidebarItemId
    | ErrorSidebarItemId
    | TypesGroupSidebarItemId
    | ErrorsGroupSidebarItemId
    | DraftPackageSidebarItemId
    | DraftEndpointSidebarItemId
    | DraftTypeSidebarItemId
    | DraftErrorSidebarItemId;

export interface ApiConfigurationSidebarItemId extends NonDraftId {
    type: "apiConfiguration";
}

export interface SdkConfigurationSidebarItemId extends NonDraftId {
    type: "sdkConfiguration";
}

export interface PackageSidebarItemId extends NonDraftId {
    type: "package";
    packageName?: string;
    packageId: FernApiEditor.PackageId;
}

export interface EndpointSidebarItemId extends NonDraftId {
    type: "endpoint";
    endpointName?: string;
    endpointId: FernApiEditor.EndpointId;
}

export interface TypeSidebarItemId extends NonDraftId {
    type: "type";
    typeName?: string;
    typeId: FernApiEditor.TypeId;
}

export interface ErrorSidebarItemId extends NonDraftId {
    type: "error";
    errorName?: string;
    errorId: FernApiEditor.ErrorId;
}

export interface TypesGroupSidebarItemId extends NonDraftId {
    type: "typesGroup";
    packageName?: string;
    packageId: FernApiEditor.PackageId;
}

export interface ErrorsGroupSidebarItemId extends NonDraftId {
    type: "errorsGroup";
    packageName?: string;
    packageId: FernApiEditor.PackageId;
}

export interface DraftPackageSidebarItemId extends DraftId<PackageSidebarItemId> {
    parent: FernApiEditor.PackageId | undefined;
}

export interface DraftEndpointSidebarItemId extends DraftId<EndpointSidebarItemId> {
    parent: FernApiEditor.PackageId;
}

export interface DraftTypeSidebarItemId extends DraftId<TypeSidebarItemId> {
    parent: FernApiEditor.PackageId;
}

export interface DraftErrorSidebarItemId extends DraftId<ErrorSidebarItemId> {
    parent: FernApiEditor.PackageId;
}

export type DraftId<NonDraftVersion> = Omit<NonDraftVersion, keyof NonDraftId> & {
    isDraft: true;
};

export interface NonDraftId {
    isDraft?: false;
}
