import { useCallback } from "react";
import { DraftSidebarItemId } from "../context/SidebarContext";
import { useSidebarContext, useSidebarItemState } from "../context/useSidebarContext";
import { SidebarItemId } from "../ids/SidebarItemId";

export declare namespace useAddDraft {
    export interface Args {
        sidebarItemId: SidebarItemId;
        createDraft: () => DraftSidebarItemId;
    }

    export interface Return {
        onClickAdd: () => void;
    }
}

export function useAddDraft({ sidebarItemId, createDraft }: useAddDraft.Args): useAddDraft.Return {
    const [, setSidebarItemState] = useSidebarItemState(sidebarItemId);
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
