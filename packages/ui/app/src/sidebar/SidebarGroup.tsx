import { PropsWithChildren, useContext, useMemo } from "react";
import { SidebarContext, SidebarContextValue } from "./context/SidebarContext";

export declare namespace SidebarGroup {
    export type Props = PropsWithChildren<{
        title: JSX.Element | string;
    }>;
}

export const SidebarGroup: React.FC<SidebarGroup.Props> = ({ title, children }) => {
    const { depth } = useContext(SidebarContext);
    const contextValue = useMemo((): SidebarContextValue => ({ depth: depth + 1 }), [depth]);

    return (
        <div className="flex flex-col">
            {title}
            <SidebarContext.Provider value={contextValue}>
                <div className="flex">
                    <div className="flex flex-1 flex-col min-w-0">{children}</div>
                </div>
            </SidebarContext.Provider>
        </div>
    );
};
