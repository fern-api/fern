import { useContext } from "react";
import { SidebarItemId } from "../ids/SidebarItemId";
import { StringifiedSidebarItemId } from "../ids/StringifiedSidebarItemId";
import { SidebarContext, SidebarContextValue, SidebarItemState } from "./SidebarContext";

export function useSidebarContext(): SidebarContextValue {
    return useContext(SidebarContext)();
}

export function useSidebarItemState(
    itemId: SidebarItemId
): [SidebarItemState | undefined, (newState: SidebarItemState) => void];
export function useSidebarItemState(
    itemId: SidebarItemId,
    defaultState: SidebarItemState
): [SidebarItemState, (newState: SidebarItemState) => void];
export function useSidebarItemState(
    itemId: SidebarItemId,
    defaultState?: SidebarItemState
): [SidebarItemState | undefined, (newState: SidebarItemState) => void] {
    const { states, setState } = useSidebarContext();
    return [
        states[StringifiedSidebarItemId.stringify(itemId)] ?? defaultState,
        (newState) => setState(itemId, newState),
    ];
}
