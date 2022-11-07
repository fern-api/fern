import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import {
    DraftEndpointSidebarItemId,
    DraftErrorSidebarItemId,
    DraftPackageSidebarItemId,
    DraftSidebarItemId,
    DraftTypeSidebarItemId,
} from "./DraftSidebarItemId";

export type MaybeDraftPackage = DraftableItem<FernApiEditor.Package, DraftPackageSidebarItemId>;
export type MaybeDraftEndpoint = DraftableItem<FernApiEditor.Endpoint, DraftEndpointSidebarItemId>;
export type MaybeDraftType = DraftableItem<FernApiEditor.Type, DraftTypeSidebarItemId>;
export type MaybeDraftError = DraftableItem<FernApiEditor.Error, DraftErrorSidebarItemId>;

export type DraftableItem<DefinitionValue, DraftId extends DraftSidebarItemId> =
    | ({ isDraft: false } & DefinitionValue)
    | ({ isDraft: true } & DraftId);
