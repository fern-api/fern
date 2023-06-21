import classNames from "classnames";
import { useCallback } from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
import { BuiltWithFern } from "./BuiltWithFern";
import { SidebarContext, SidebarContextValue } from "./context/SidebarContext";
import styles from "./Sidebar.module.scss";
import { SidebarItems } from "./SidebarItems";

export declare namespace Sidebar {
    export interface Props {
        expandAllSections?: boolean;
    }
}

export const Sidebar: React.FC<Sidebar.Props> = ({ expandAllSections = false }) => {
    const { docsDefinition } = useDocsContext();

    const contextValue = useCallback((): SidebarContextValue => ({ expandAllSections }), [expandAllSections]);

    return (
        <SidebarContext.Provider value={contextValue}>
            <div className="border-border bg-background flex min-w-0 flex-1 flex-col justify-between overflow-hidden border-r">
                <div className={classNames("flex flex-1 flex-col overflow-y-auto pb-6", styles.scrollingContainer)}>
                    <SidebarItems navigationItems={docsDefinition.config.navigation.items} slug="" />
                </div>
                <BuiltWithFern />
            </div>
        </SidebarContext.Provider>
    );
};
