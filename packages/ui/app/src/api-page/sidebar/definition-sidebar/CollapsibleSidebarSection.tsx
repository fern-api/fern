import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { useBooleanState } from "@fern-api/react-commons";
import classNames from "classnames";
import { PropsWithChildren, useCallback, useMemo } from "react";
import { DefinitionSidebarIconLayout } from "./DefinitionSidebarIconLayout";
import { SidebarItemLayout } from "./SidebarItemLayout";

export declare namespace CollapsibleSidebarSection {
    export type Props = PropsWithChildren<{
        title: JSX.Element | string | ((args: { isCollapsed: boolean; isHovering: boolean }) => JSX.Element);
    }>;
}

export const CollapsibleSidebarSection: React.FC<CollapsibleSidebarSection.Props> = ({ title, children }) => {
    const { value: isCollapsed, toggleValue: toggleIsCollapsed } = useBooleanState(true);

    const renderIcon = useCallback(
        ({ isHovering }: { isHovering: boolean }) => {
            return (
                <div className="flex justify-center items-center cursor-pointer rounded w-5 h-5 hover:bg-gray-200">
                    <Icon
                        className={isHovering ? "text-gray-800" : "text-gray-400"}
                        icon={isCollapsed ? IconNames.CHEVRON_RIGHT : IconNames.CHEVRON_DOWN}
                    />
                </div>
            );
        },
        [isCollapsed]
    );

    const renderTitle = useMemo(() => {
        if (typeof title === "function") {
            return ({ isHovering }: { isHovering: boolean }) => {
                return title({ isCollapsed, isHovering });
            };
        } else {
            return title;
        }
    }, [isCollapsed, title]);

    return (
        <div className="flex flex-col">
            <SidebarItemLayout title={renderTitle} icon={renderIcon} onClick={toggleIsCollapsed} />
            <div
                className={classNames("flex", {
                    hidden: isCollapsed,
                })}
            >
                <DefinitionSidebarIconLayout />
                <div className="flex flex-1 flex-col min-w-0">{children}</div>
            </div>
        </div>
    );
};
