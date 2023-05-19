import { PropsWithChildren, useContext, useMemo } from "react";
import { ResolvedUrlPath } from "../../api-page/api-context/url-path-resolver/UrlPathResolver";
import { ClickableSidebarItem } from "./ClickableSidebarItem";
import { SidebarContext, SidebarContextValue } from "./context/SidebarContext";

export declare namespace SidebarGroup {
    export type Props = PropsWithChildren<{
        title: JSX.Element | string;
        path: string;
        resolvedUrlPath: ResolvedUrlPath;
        isSelected: boolean;
    }>;
}

export const SidebarGroup: React.FC<SidebarGroup.Props> = ({ title, path, isSelected, children }) => {
    const { depth } = useContext(SidebarContext);
    const contextValue = useMemo((): SidebarContextValue => ({ depth: depth + 1 }), [depth]);

    return (
        <div className="flex flex-col">
            <ClickableSidebarItem title={title} path={path} isSelected={isSelected} />
            <SidebarContext.Provider value={contextValue}>
                <div className="flex">
                    <div className="flex flex-1 flex-col min-w-0">{children}</div>
                </div>
            </SidebarContext.Provider>
        </div>
    );
};
