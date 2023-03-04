import classNames from "classnames";
import React from "react";
import { ApiDefinitionContextProviderForTab } from "./ApiDefinitionContextProviderForTab";
import styles from "./ApiTabBar.module.scss";
import { ApiTabBarItem } from "./ApiTabBarItem";
import { useApiTabsContext } from "./context/useApiTabsContext";
import { TabBarItemWrapper } from "./TabBarItemWrapper";

export const ApiTabBar: React.FC = () => {
    const { tabs } = useApiTabsContext();

    return (
        <div className={classNames(styles.container, "flex h-9 overflow-auto")}>
            {tabs.map((tab) => {
                return (
                    <React.Fragment key={tab.path}>
                        <ApiDefinitionContextProviderForTab tab={tab}>
                            <ApiTabBarItem tab={tab} />
                        </ApiDefinitionContextProviderForTab>
                    </React.Fragment>
                );
            })}
            <TabBarItemWrapper className="flex-1 bg-gray-200 border-b border-gray-300" />
        </div>
    );
};
