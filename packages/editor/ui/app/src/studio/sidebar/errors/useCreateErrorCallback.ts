import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { useCallback, useMemo } from "react";
import { MaybeDraftPackage } from "../drafts/DraftableItem";
import { DraftErrorSidebarItemId } from "../drafts/DraftSidebarItemId";
import { SidebarItemIdGenerator } from "../ids/SidebarItemIdGenerator";
import { useAddDraft } from "../shared/useAddDraft";

export declare namespace useCreateErrorCallback {
    export interface Args {
        package_: MaybeDraftPackage;
    }
}

export function useCreateErrorCallback({ package_ }: useCreateErrorCallback.Args): () => void {
    const createDraft = useCallback((): DraftErrorSidebarItemId => {
        return {
            type: "error",
            parent: package_.packageId,
            errorId: EditorItemIdGenerator.error(),
        };
    }, [package_.packageId]);

    const sidebarItemId = useMemo(() => SidebarItemIdGenerator.errors(package_), [package_]);

    const { onClickAdd } = useAddDraft({
        sidebarItemId,
        createDraft,
    });

    return onClickAdd;
}
