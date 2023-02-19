import classNames from "classnames";
import React from "react";
import styles from "./ApiTabBar.module.scss";
import { ApiTabBarItem } from "./ApiTabBarItem";
import { useApiTabsContext } from "./context/useApiTabsContext";
import { TabApiDefinitionContextProvider } from "./TabApiDefinitionContextProvider";
import { TabBarItemWrapper } from "./TabBarItemWrapper";

export const ApiTabBar: React.FC = () => {
    const { tabs } = useApiTabsContext();

    return (
        <div className={classNames(styles.container, "flex h-10 overflow-auto")}>
            {tabs.map((tab, index) => {
                const previousTab = tabs[index - 1];
                const isPreviousTabSelected = previousTab != null && previousTab.isSelected;

                return (
                    <React.Fragment key={tab.path}>
                        {index > 0 && (
                            <TabBarItemWrapper
                                includeBottomBorder={!tab.isSelected && !isPreviousTabSelected}
                                className="w-px"
                            />
                        )}
                        <TabApiDefinitionContextProvider tab={tab}>
                            <ApiTabBarItem tab={tab} />
                        </TabApiDefinitionContextProvider>
                    </React.Fragment>
                );
            })}
            <TabBarItemWrapper includeBottomBorder className="flex-1 bg-gray-500" />
        </div>
    );
};
