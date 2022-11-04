import { createContext } from "react";

export const SidebarItemRowContext = createContext<SidebarItemRowContextValue>({ indent: 0 });

export interface SidebarItemRowContextValue {
    indent: number;
}
