import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { useCallback, useMemo } from "react";
import { MaybeDraftPackage } from "../../../../sidebar/drafts/DraftableItem";
import { DraftErrorSidebarItemId } from "../../../../sidebar/drafts/DraftSidebarItemId";
import { SidebarItemIdGenerator } from "../../../../sidebar/ids/SidebarItemIdGenerator";
import { useAddDraftToGroup } from "../../../shared/useAddDraftToGroup";

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

    const errorsSidebarItemId = useMemo(() => SidebarItemIdGenerator.errors(package_), [package_]);

    const { onClickAdd } = useAddDraftToGroup({
        sidebarItemIdOfGroup: errorsSidebarItemId,
        createDraft,
    });

    return onClickAdd;
}
