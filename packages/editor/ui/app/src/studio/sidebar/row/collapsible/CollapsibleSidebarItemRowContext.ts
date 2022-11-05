import { createContext } from "react";

export const CollapsibleSidebarItemRowContext = createContext<CollapsibleSidebarItemRowContext>({
    indent: 0,
});

export interface CollapsibleSidebarItemRowContext {
    indent: number;
}
