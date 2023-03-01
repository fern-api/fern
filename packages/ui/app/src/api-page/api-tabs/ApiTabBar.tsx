import { Classes } from "@blueprintjs/core";
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
        <div className={classNames(styles.container, Classes.DARK, "flex h-11 overflow-auto bg-zinc-800 gap-px")}>
            {tabs.map((tab) => {
                return (
                    <React.Fragment key={tab.path}>
                        <ApiDefinitionContextProviderForTab tab={tab}>
                            <ApiTabBarItem tab={tab} />
                        </ApiDefinitionContextProviderForTab>
                    </React.Fragment>
                );
            })}
            <TabBarItemWrapper className="flex-1" />
        </div>
    );
};
