import { Popover2Props } from "@blueprintjs/popover2";
import { createContext, useContext } from "react";

export const SidebarItemRowContext = createContext<() => SidebarItemRowContextValue>(() => {
    throw new Error("SidebarItemRowContext not found in tree");
});

export interface SidebarItemRowContextValue {
    isSelected: boolean;
    isHovering: boolean;
    isMouseDown: boolean;
    popoverProps: Popover2Props;
    onMouseOver: (event: React.MouseEvent) => void;
    onMouseLeave: (event: React.MouseEvent) => void;
    onMouseMove: (event: React.MouseEvent) => void;
    onMouseDown: (event: React.MouseEvent) => void;
    onClick: (event: React.MouseEvent) => void;
}

export function useSidebarItemRowContext(): SidebarItemRowContextValue {
    return useContext(SidebarItemRowContext)();
}
