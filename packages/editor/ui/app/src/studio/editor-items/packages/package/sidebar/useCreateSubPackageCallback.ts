import { useMemo } from "react";
import { MaybeDraftPackage } from "../../../../sidebar/drafts/DraftableItem";
import { SidebarItemIdGenerator } from "../../../../sidebar/ids/SidebarItemIdGenerator";
import { useAddDraftToGroup } from "../../../shared/useAddDraftToGroup";
import { useCreateDraftPackage } from "./useCreateDraftPackage";

export declare namespace useCreateSubPackageCallback {
    export interface Args {
        parent: MaybeDraftPackage;
    }
}

export function useCreateSubPackageCallback({ parent }: useCreateSubPackageCallback.Args): () => void {
    const createDraft = useCreateDraftPackage({ parent: parent.packageId });
    const parentSidebarItemId = useMemo(() => SidebarItemIdGenerator.package(parent), [parent]);

    const { onClickAdd } = useAddDraftToGroup({
        sidebarItemIdOfGroup: parentSidebarItemId,
        createDraft,
    });

    return onClickAdd;
}
