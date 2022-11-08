import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { useCallback, useMemo } from "react";
import { MaybeDraftPackage } from "../../../../sidebar/drafts/DraftableItem";
import { DraftEndpointSidebarItemId } from "../../../../sidebar/drafts/DraftSidebarItemId";
import { SidebarItemIdGenerator } from "../../../../sidebar/ids/SidebarItemIdGenerator";
import { useAddDraftToGroup } from "../../../shared/useAddDraftToGroup";

export declare namespace useCreateEndpointCallback {
    export interface Args {
        package_: MaybeDraftPackage;
    }
}

export function useCreateEndpointCallback({ package_ }: useCreateEndpointCallback.Args): () => void {
    const createDraft = useCallback((): DraftEndpointSidebarItemId => {
        return {
            type: "endpoint",
            parent: package_.packageId,
            endpointId: EditorItemIdGenerator.endpoint(),
        };
    }, [package_.packageId]);

    const packageSidebarItemId = useMemo(() => SidebarItemIdGenerator.package(package_), [package_]);

    const { onClickAdd } = useAddDraftToGroup({
        sidebarItemIdOfGroup: packageSidebarItemId,
        createDraft,
    });

    return onClickAdd;
}
