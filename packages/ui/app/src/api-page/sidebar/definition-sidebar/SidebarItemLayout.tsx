import { useIsHovering } from "@fern-api/react-commons";
import { DefinitionSidebarIcon } from "./DefinitionSidebarIcon";
import { SidebarItemSelectionOverlay } from "./SidebarItemSelectionOverlay";

export declare namespace SidebarItemLayout {
    export interface Props {
        title: JSX.Element | string | ((args: { isHovering: boolean }) => JSX.Element | string);
        icon?: JSX.Element | string;
        overlayClassName?: string | ((args: { isHovering: boolean }) => string | undefined);
        onClick: () => void;
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

    const maybeOverlayClassName =
        typeof overlayClassName === "function" ? overlayClassName({ isHovering }) : overlayClassName;

    return (
        <div
            className="relative flex items-center cursor-pointer select-none h-[30px] whitespace-nowrap"
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            {...hoveringCallbacks}
        >
            {maybeOverlayClassName && <SidebarItemSelectionOverlay className={maybeOverlayClassName} />}
            {icon != null && (
                <div
                    // z index so it renders above the overlay
                    className="z-0"
                >
                    <DefinitionSidebarIcon>{icon}</DefinitionSidebarIcon>
                </div>
            )}
            <div
                // z index so it renders above the overlay
                className="z-0 min-w-0"
            >
                {typeof title === "function" ? title({ isHovering }) : title}
            </div>
        </div>
    );
};
