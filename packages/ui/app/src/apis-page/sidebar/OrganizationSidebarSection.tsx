import { Icon } from "@blueprintjs/core";
import { IconName } from "@blueprintjs/icons";
import { PropsWithChildren } from "react";

export declare namespace OrganizationSidebarSection {
    export type Props = PropsWithChildren<{
        title: string;
        rightAction?: {
            label: string;
            onClick: () => void;
            icon?: IconName;
        };
    }>;
}

export const OrganizationSidebarSection: React.FC<OrganizationSidebarSection.Props> = ({
    title,
    rightAction,
    children,
}) => {
    return (
        <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <div className="uppercase text-gray-500 font-bold">{title}</div>
                {rightAction != null && (
                    <div
                        className="flex items-center gap-1 text-green-700 hover:bg-gray-200 p-1 rounded cursor-pointer"
                        onClick={rightAction.onClick}
                    >
                        {rightAction.icon != null && <Icon icon={rightAction.icon} />}
                        {rightAction.label}
                    </div>
                )}
            </div>
            {children}
        </div>
    );
};
