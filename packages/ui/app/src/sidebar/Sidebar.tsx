import classNames from "classnames";
import { useCallback } from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useSearchContext } from "../search-context/useSearchContext";
import { useSearchService } from "../services/useSearchService";
import { BuiltWithFern } from "./BuiltWithFern";
import { SidebarContext, SidebarContextValue } from "./context/SidebarContext";
import styles from "./Sidebar.module.scss";
import { SidebarItems } from "./SidebarItems";
import { SidebarSearchBar } from "./SidebarSearchBar";

export declare namespace Sidebar {
    export interface Props {
        expandAllSections?: boolean;
    }
}

export const Sidebar: React.FC<Sidebar.Props> = ({ expandAllSections = false }) => {
    const { docsInfo } = useDocsContext();
    const { openSearchDialog } = useSearchContext();
    const searchService = useSearchService();

    const contextValue = useCallback((): SidebarContextValue => ({ expandAllSections }), [expandAllSections]);

    return (
        <SidebarContext.Provider value={contextValue}>
            <div className="border-border bg-background flex min-w-0 flex-1 flex-col justify-between overflow-hidden border-r">
                <div className="z-10 flex flex-col px-2.5 pt-2.5 shadow-[0_-5px_10px_10px_rgba(18,20,24,1)]">
                    {searchService.isAvailable && <SidebarSearchBar onClick={openSearchDialog} />}
                </div>
                <div className={classNames("flex flex-1 flex-col overflow-y-auto pb-6", styles.scrollingContainer)}>
                    <SidebarItems
                        navigationItems={docsInfo.activeNavigationConfig.items}
                        slug={docsInfo.type === "versioned" ? docsInfo.activeVersion : ""}
                    />
                </div>
                <BuiltWithFern />
            </div>
        </SidebarContext.Provider>
    );
};
