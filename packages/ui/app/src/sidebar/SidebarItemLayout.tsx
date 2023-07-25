import { Text } from "@blueprintjs/core";
import { useIsHovering } from "@fern-api/react-commons";
import classNames from "classnames";
import { useContext } from "react";
import { SidebarDepthContext } from "./context/SidebarDepthContext";

export declare namespace SidebarItemLayout {
    export interface Props {
        title: JSX.Element | string | ((args: { isHovering: boolean }) => JSX.Element | string);
        className?: string;
        isSelected?: boolean;
    }
}

export const SidebarItemLayout: React.FC<SidebarItemLayout.Props> = ({ className, title, isSelected = false }) => {
    const { isHovering, ...hoveringCallbacks } = useIsHovering();

    const sidebarContext = useContext(SidebarDepthContext);

    return (
        <Text
            ellipsize
            className={classNames(className, "flex shrink-0 z-0 items-center h-[30px] min-w-0 text-text-default", {
                "bg-accentHighlight relative": isSelected,
            })}
            style={{
                paddingLeft: 16 + (sidebarContext != null ? 16 * sidebarContext.depth : 0),
                paddingRight: 16,
            }}
            {...hoveringCallbacks}
        >
            {typeof title === "function" ? title({ isHovering }) : title}
            {isSelected && <div className="bg-accentPrimary absolute inset-y-0 right-0 w-1" />}
        </Text>
    );
};
