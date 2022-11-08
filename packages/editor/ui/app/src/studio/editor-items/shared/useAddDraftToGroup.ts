import { useCallback } from "react";
import { useSidebarContext, useSidebarItemState } from "../../sidebar/context/useSidebarContext";
import { DraftSidebarItemId } from "../../sidebar/drafts/DraftSidebarItemId";
import { SidebarItemId } from "../../sidebar/ids/SidebarItemId";

export declare namespace useAddDraftToGroup {
    export interface Args {
        sidebarItemIdOfGroup: SidebarItemId;
        createDraft: () => DraftSidebarItemId;
    }

    export interface Return {
        onClickAdd: () => void;
    }
}

export function useAddDraftToGroup({
    sidebarItemIdOfGroup,
    createDraft,
}: useAddDraftToGroup.Args): useAddDraftToGroup.Return {
    const [, setSidebarItemState] = useSidebarItemState(sidebarItemIdOfGroup);
    const { setDraft } = useSidebarContext();

    const onClickAdd = useCallback(() => {
        setDraft(createDraft());
        setSidebarItemState({
            isCollapsed: false,
        });
    }, [createDraft, setDraft, setSidebarItemState]);

    return {
        onClickAdd,
    };
}
