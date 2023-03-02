import { PropsWithChildren, useCallback, useState } from "react";
import { OrganizationTabBarContext, OrganizationTabBarContextValue } from "./OrganizationTabBarContext";
import { OrganizationTabId } from "./OrganizationTabId";

export const OrganizationTabBarContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [selectedTabId, setSelectedTabId] = useState<OrganizationTabId>(OrganizationTabId.APIS);

    const contextValue = useCallback(
        (): OrganizationTabBarContextValue => ({
            selectedTabId,
            setSelectedTabId,
        }),
        [selectedTabId]
    );

    return <OrganizationTabBarContext.Provider value={contextValue}>{children}</OrganizationTabBarContext.Provider>;
};
