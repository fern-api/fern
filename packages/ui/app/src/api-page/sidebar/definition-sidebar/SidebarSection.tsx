import { PropsWithChildren } from "react";
import { ClickableSidebarItem } from "./ClickableSidebarItem";

export declare namespace SidebarSection {
    export type Props = PropsWithChildren<{
        title: JSX.Element | string;
        path: string;
        isSelected: boolean;
    }>;
}

export const SidebarSection: React.FC<SidebarSection.Props> = ({ title, path, isSelected, children }) => {
    return (
        <div className="flex flex-col">
            <ClickableSidebarItem title={title} path={path} isSelected={isSelected} />
            <div className="flex">
                <div className="flex flex-1 flex-col min-w-0">{children}</div>
            </div>
        </div>
    );
};
