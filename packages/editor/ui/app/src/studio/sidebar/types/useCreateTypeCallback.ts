import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { useCallback, useMemo } from "react";
import { MaybeDraftPackage } from "../drafts/DraftableItem";
import { DraftTypeSidebarItemId } from "../drafts/DraftSidebarItemId";
import { SidebarItemIdGenerator } from "../ids/SidebarItemIdGenerator";
import { useAddDraft } from "../shared/useAddDraft";

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

    const sidebarItemId = useMemo(() => SidebarItemIdGenerator.types(package_), [package_]);

    const { onClickAdd } = useAddDraft({
        sidebarItemId,
        createDraft,
    });

    return onClickAdd;
}
