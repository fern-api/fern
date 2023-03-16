import classNames from "classnames";
import React from "react";
import { ApiDefinitionContextProviderForTab } from "./ApiDefinitionContextProviderForTab";
import styles from "./ApiTabBar.module.scss";
import { ApiTabBarItem } from "./ApiTabBarItem";
import { useApiTabsContext } from "./context/useApiTabsContext";
import { TabBarBottomLine } from "./TabBarBottomLine";
import { TabBarItemWrapper } from "./TabBarItemWrapper";

export const ApiTabBar: React.FC = () => {
    const { tabs } = useApiTabsContext();

    return (
        <div className="flex h-9 overflow-y-visible">
            <div className={classNames(styles.noScrollBar, "flex overflow-x-auto")}>
                {tabs.map((tab) => {
                    return (
                        <React.Fragment key={tab.path}>
                            <ApiDefinitionContextProviderForTab tab={tab}>
                                <ApiTabBarItem tab={tab} />
                            </ApiDefinitionContextProviderForTab>
                        </React.Fragment>
                    );
                })}
            </div>
            <TabBarItemWrapper className="flex-1 bg-gray-200">
                <TabBarBottomLine />
            </TabBarItemWrapper>
        </div>
    );
};
