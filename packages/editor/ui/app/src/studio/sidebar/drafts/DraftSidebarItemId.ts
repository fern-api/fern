import { FernApiEditor } from "@fern-fern/api-editor-sdk";

export type DraftSidebarItemId =
    | DraftPackageSidebarItemId
    | DraftEndpointSidebarItemId
    | DraftTypeSidebarItemId
    | DraftErrorSidebarItemId;

export interface DraftPackageSidebarItemId {
    type: "package";
    packageId: FernApiEditor.PackageId;
    parent: FernApiEditor.PackageId | undefined;
}

export interface DraftEndpointSidebarItemId {
    type: "endpoint";
    endpointId: FernApiEditor.EndpointId;
    parent: FernApiEditor.PackageId;
}

export interface DraftTypeSidebarItemId {
    type: "type";
    typeId: FernApiEditor.TypeId;
    parent: FernApiEditor.PackageId;
}

export interface DraftErrorSidebarItemId {
    type: "error";
    errorId: FernApiEditor.ErrorId;
    parent: FernApiEditor.PackageId;
}
