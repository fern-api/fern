import { createContext } from "react";
import { OrganizationTabId } from "./OrganizationTabId";

export const OrganizationTabBarContext = createContext<() => OrganizationTabBarContextValue>(() => {
    throw new Error("OrganizationTabBarContextProvider not found in tree");
});

export interface OrganizationTabBarContextValue {
    selectedTabId: OrganizationTabId;
    setSelectedTabId: (tabId: OrganizationTabId) => void;
}
