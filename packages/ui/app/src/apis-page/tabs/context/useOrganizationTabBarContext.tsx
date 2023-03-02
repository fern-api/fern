import { useContext } from "react";
import { OrganizationTabBarContext, OrganizationTabBarContextValue } from "./OrganizationTabBarContext";

export function useOrganizationTabBarContext(): OrganizationTabBarContextValue {
    return useContext(OrganizationTabBarContext)();
}
