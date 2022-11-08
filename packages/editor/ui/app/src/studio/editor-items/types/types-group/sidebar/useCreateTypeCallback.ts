import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { useCallback, useMemo } from "react";
import { MaybeDraftPackage } from "../../../../sidebar/drafts/DraftableItem";
import { DraftTypeSidebarItemId } from "../../../../sidebar/drafts/DraftSidebarItemId";
import { SidebarItemIdGenerator } from "../../../../sidebar/ids/SidebarItemIdGenerator";
import { useAddDraftToGroup } from "../../../shared/useAddDraftToGroup";

export declare namespace useCreateTypeCallback {
    export interface Args {
        package_: MaybeDraftPackage;
    }
}

export function useCreateTypeCallback({ package_ }: useCreateTypeCallback.Args): () => void {
    const createDraft = useCallback((): DraftTypeSidebarItemId => {
        return {
            type: "type",
            parent: package_.packageId,
            typeId: EditorItemIdGenerator.type(),
        };
    }, [package_.packageId]);

    const typesSidebarItemId = useMemo(() => SidebarItemIdGenerator.types(package_), [package_]);

    const { onClickAdd } = useAddDraftToGroup({
        sidebarItemIdOfGroup: typesSidebarItemId,
        createDraft,
    });

    return onClickAdd;
}
