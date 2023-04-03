import { PropsWithChildren } from "react";
import { SidebarItemLayout } from "./SidebarItemLayout";

export declare namespace SidebarSection {
    export type Props = PropsWithChildren<{
        title: JSX.Element | string;
    }>;
}

export const SidebarSection: React.FC<SidebarSection.Props> = ({ title, children }) => {
    return (
        <div className="flex flex-col">
            <SidebarItemLayout title={title} />
            <div className="flex">
                <div className="flex flex-1 flex-col min-w-0 ml-2">{children}</div>
            </div>
        </div>
    );
};
