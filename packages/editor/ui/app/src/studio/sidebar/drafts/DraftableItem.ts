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
    | Draft<DraftId>
    | Persisted<DefinitionValue>;

export type Draft<DraftId extends DraftSidebarItemId> = { isDraft: true } & DraftId;
export type Persisted<DefinitionValue> = { isDraft: false } & DefinitionValue;
