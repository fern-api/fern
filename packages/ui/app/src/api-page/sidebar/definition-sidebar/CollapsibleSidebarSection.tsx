import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { useBooleanState } from "@fern-api/react-commons";
import { PropsWithChildren, useCallback } from "react";
import { SidebarItemLayout } from "./SidebarItemLayout";

export declare namespace CollapsibleSidebarSection {
    export type Props = PropsWithChildren<{
        title: string;
        openIcon?: JSX.Element;
        closedIcon?: JSX.Element;
    }>;
}

export const CollapsibleSidebarSection: React.FC<CollapsibleSidebarSection.Props> = ({
    title,
    openIcon = <Icon icon={IconNames.CHEVRON_DOWN} />,
    closedIcon = <Icon icon={IconNames.CHEVRON_RIGHT} />,
    children,
}) => {
    const { value: isCollapsed, toggleValue: toggleIsCollapsed } = useBooleanState(true);

    const getOverlayClassName = useCallback(({ isHovering }: { isHovering: boolean }) => {
        if (isHovering) {
            return "bg-neutral-200";
        }
        return undefined;
    }, []);

    return (
        <div className="flex flex-col">
            <SidebarItemLayout
                title={title}
                icon={isCollapsed ? closedIcon : openIcon}
                onClick={toggleIsCollapsed}
                overlayClassName={getOverlayClassName}
            />
            {isCollapsed || (
                <div className="flex">
                    <div
                        // the width lines up with the sidebar icon
                        className="w-7 flex justify-center"
                    >
                        <div
                            // z index so it renders above the hover overlay
                            className="z-0 -mt-[6px] w-px bg-green-500/25"
                        />
                    </div>
                    <div className="flex flex-1 flex-col gap-[1px] mt-[1px]">{children}</div>
                </div>
            )}
        </div>
    );
};
