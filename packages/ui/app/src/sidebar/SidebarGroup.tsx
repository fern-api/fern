import classNames from "classnames";
import { PropsWithChildren, useContext, useMemo } from "react";
import { SidebarContext, SidebarContextValue } from "./context/SidebarContext";

export declare namespace SidebarGroup {
    export type Props = PropsWithChildren<{
        title: JSX.Element | string;
        includeTopMargin?: boolean;
    }>;
}

export const SidebarGroup: React.FC<SidebarGroup.Props> = ({ title, includeTopMargin = false, children }) => {
    const sidebarContext = useContext(SidebarContext);
    const contextValue = useMemo(
        (): SidebarContextValue => ({ depth: sidebarContext != null ? sidebarContext.depth + 1 : 0 }),
        [sidebarContext]
    );

    return (
        <div
            className={classNames("flex flex-col", {
                "mt-4": includeTopMargin,
            })}
        >
            {title}
            <SidebarContext.Provider value={contextValue}>
                <div className="flex">
                    <div className="flex flex-1 flex-col min-w-0">{children}</div>
                </div>
            </SidebarContext.Provider>
        </div>
    );
};
