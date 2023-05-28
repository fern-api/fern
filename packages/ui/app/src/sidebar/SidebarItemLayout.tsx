import { Text } from "@blueprintjs/core";
import { useIsHovering } from "@fern-api/react-commons";
import classNames from "classnames";
import { useContext } from "react";
import { SidebarContext } from "./context/SidebarContext";

export declare namespace SidebarItemLayout {
    export interface Props {
        title: JSX.Element | string | ((args: { isHovering: boolean }) => JSX.Element | string);
        className?: string;
        onClick?: () => void;
        onDoubleClick?: () => void;
        isSelected?: boolean;
    }
}

export const SidebarItemLayout: React.FC<SidebarItemLayout.Props> = ({
    className,
    title,
    onClick,
    onDoubleClick,
    isSelected,
}) => {
    const { isHovering, ...hoveringCallbacks } = useIsHovering();

    const isClickable = onClick != null || onDoubleClick != null;

    const sidebarContext = useContext(SidebarContext);

    return (
        <Text
            ellipsize
            className={classNames(className, "flex shrink-0 items-center h-[30px] min-w-0 text-neutral-400", {
                "cursor-pointer": isClickable,
                "bg-accentHighlight relative": isSelected,
            })}
            style={{
                paddingLeft: 24 + (sidebarContext != null ? 16 * sidebarContext.depth : 0),
                paddingRight: 24,
            }}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            {...hoveringCallbacks}
        >
            {typeof title === "function" ? title({ isHovering }) : title}
            {isSelected && <div className="w-1 bg-accentPrimary absolute top-0 right-0 bottom-0" />}
        </Text>
    );
};
