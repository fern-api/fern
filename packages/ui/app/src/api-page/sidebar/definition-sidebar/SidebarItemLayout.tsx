import { Icon, IconName } from "@blueprintjs/core";
import { useIsHovering } from "@fern-api/react-commons";
import classNames from "classnames";
import { DefinitionSidebarIconLayout } from "./DefinitionSidebarIconLayout";
import { SidebarItemSelectionOverlay } from "./SidebarItemSelectionOverlay";

export declare namespace SidebarItemLayout {
    export interface Props {
        title: JSX.Element | string | ((args: { isHovering: boolean }) => JSX.Element | string);
        icon?: JSX.Element | IconName | ((args: { isHovering: boolean }) => JSX.Element | IconName);
        overlayClassName?: string | ((args: { isHovering: boolean }) => string | undefined);
        onClick?: () => void;
        onDoubleClick?: () => void;
    }
}

export const SidebarItemLayout: React.FC<SidebarItemLayout.Props> = ({
    title,
    icon,
    onClick,
    onDoubleClick,
    overlayClassName,
}) => {
    const { isHovering, ...hoveringCallbacks } = useIsHovering();

    const isClickable = onClick != null || onDoubleClick != null;

    const maybeOverlayClassName =
        typeof overlayClassName === "function" ? overlayClassName({ isHovering }) : overlayClassName;
    const maybeIcon = typeof icon === "function" ? icon({ isHovering }) : icon;

    return (
        <div
            className={classNames("relative flex select-none h-[30px] whitespace-nowrap", {
                "cursor-pointer": isClickable,
            })}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            {...hoveringCallbacks}
        >
            {maybeOverlayClassName && <SidebarItemSelectionOverlay className={maybeOverlayClassName} />}
            {maybeIcon != null && (
                <div
                    // z index so it renders above the overlay
                    className="flex z-0"
                >
                    <DefinitionSidebarIconLayout>
                        {typeof maybeIcon === "string" ? <Icon icon={maybeIcon} /> : maybeIcon}
                    </DefinitionSidebarIconLayout>
                </div>
            )}
            <div
                // z index so it renders above the overlay
                className="z-0 min-w-0 flex items-center"
            >
                {typeof title === "function" ? title({ isHovering }) : title}
            </div>
        </div>
    );
};
