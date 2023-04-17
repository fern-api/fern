import { Text } from "@blueprintjs/core";
import { useIsHovering } from "@fern-api/react-commons";
import classNames from "classnames";

export declare namespace SidebarItemLayout {
    export interface Props {
        title: JSX.Element | string | ((args: { isHovering: boolean }) => JSX.Element | string);
        onClick?: () => void;
        onDoubleClick?: () => void;
    }
}

export const SidebarItemLayout: React.FC<SidebarItemLayout.Props> = ({ title, onClick, onDoubleClick }) => {
    const { isHovering, ...hoveringCallbacks } = useIsHovering();

    const isClickable = onClick != null || onDoubleClick != null;

    return (
        <Text
            ellipsize
            className={classNames("h-[30px] min-w-0", {
                "cursor-pointer select-none": isClickable,
            })}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            {...hoveringCallbacks}
        >
            {typeof title === "function" ? title({ isHovering }) : title}
        </Text>
    );
};
