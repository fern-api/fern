import { Text } from "@blueprintjs/core";
import classNames from "classnames";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDocsContext } from "../docs-context/useDocsContext";
import { SidebarItemLayout } from "./SidebarItemLayout";

export declare namespace AnchorSidebarItem {
    export interface Props {
        title: JSX.Element | string;
        anchor: string;
        onClick?: () => void;
    }
}

export const AnchorSidebarItem: React.FC<AnchorSidebarItem.Props> = ({ title, anchor, onClick }) => {
    const { navigateToAnchor, anchorInView } = useDocsContext();
    const navigate = useNavigate();

    const handleClick = useCallback(() => {
        navigate({ hash: anchor });
        navigateToAnchor(anchor);
        onClick?.();
    }, [anchor, navigate, navigateToAnchor, onClick]);

    const isSelected = anchorInView === anchor;

    const renderTitle = useCallback(
        ({ isHovering }: { isHovering: boolean }) => {
            return (
                <>
                    <Text
                        className={classNames("select-none", {
                            "text-gray-300": isSelected,
                            "text-white": isHovering && isSelected,
                            "text-[#B1BCF1]": isHovering && !isSelected,
                        })}
                        ellipsize
                    >
                        {title}
                    </Text>
                </>
            );
        },
        [isSelected, title]
    );

    return <SidebarItemLayout title={renderTitle} onClick={handleClick} />;
};
