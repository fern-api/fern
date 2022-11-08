import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import {
    DraftEndpointSidebarItemId,
    DraftErrorSidebarItemId,
    DraftPackageSidebarItemId,
    DraftSidebarItemId,
    DraftTypeSidebarItemId,
} from "./DraftSidebarItemId";

export type MaybeDraftPackage = MaybeDraft<FernApiEditor.Package, DraftPackageSidebarItemId>;
export type MaybeDraftEndpoint = MaybeDraft<FernApiEditor.Endpoint, DraftEndpointSidebarItemId>;
export type MaybeDraftType = MaybeDraft<FernApiEditor.Type, DraftTypeSidebarItemId>;
export type MaybeDraftError = MaybeDraft<FernApiEditor.Error, DraftErrorSidebarItemId>;

export type MaybeDraft<DefinitionValue, DraftId extends DraftSidebarItemId> =
    | Draft<DraftId>
    | Persisted<DefinitionValue>;

export type Draft<DraftId extends DraftSidebarItemId> = { isDraft: true } & DraftId;
export type Persisted<DefinitionValue> = { isDraft: false } & DefinitionValue;
