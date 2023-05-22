import { Text } from "@blueprintjs/core";
import classNames from "classnames";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Anchor } from "../docs-context/DocsContext";
import { useDocsContext } from "../docs-context/useDocsContext";
import { SidebarItemLayout } from "./SidebarItemLayout";

export declare namespace AnchorSidebarItem {
    export interface Props {
        title: JSX.Element | string;
        anchor: Anchor;
        onClick?: () => void;
    }
}

export const AnchorSidebarItem: React.FC<AnchorSidebarItem.Props> = ({ title, anchor, onClick }) => {
    const { navigateToAnchor, anchorInView } = useDocsContext();
    const navigate = useNavigate();

    const handleClick = useCallback(() => {
        navigate({ pathname: anchor.pathname, hash: anchor.hash });
        navigateToAnchor(anchor);
        onClick?.();
    }, [anchor, navigate, navigateToAnchor, onClick]);

    const isSelected =
        anchorInView != null && anchorInView.pathname === anchor.pathname && anchorInView.hash === anchor.hash;

    const renderTitle = useCallback(
        ({ isHovering }: { isHovering: boolean }) => {
            return (
                <>
                    <Text
                        className={classNames("select-none", {
                            "text-[#B1BCF1]": isSelected,
                            "text-black dark:text-gray-400": !isSelected && isHovering,
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

    return <SidebarItemLayout title={renderTitle} onClick={handleClick} isSelected={isSelected} />;
};
