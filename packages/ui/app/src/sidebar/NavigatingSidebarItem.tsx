import { Text } from "@blueprintjs/core";
import classNames from "classnames";
import { useCallback } from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useIsSlugSelected } from "../docs-context/useIsSlugSelected";
import { SidebarItemLayout } from "./SidebarItemLayout";

export declare namespace NavigatingSidebarItem {
    export interface Props {
        title: JSX.Element | string;
        slug: string;
    }
}

export const NavigatingSidebarItem: React.FC<NavigatingSidebarItem.Props> = ({ title, slug }) => {
    const { navigateToPath } = useDocsContext();
    const handleClick = useCallback(() => {
        navigateToPath(slug);
    }, [navigateToPath, slug]);

    const isSelected = useIsSlugSelected(slug);

    const renderTitle = useCallback(
        ({ isHovering }: { isHovering: boolean }) => {
            return (
                <Text
                    className={classNames("select-none transition", {
                        "text-accentPrimary": isSelected,
                        "text-white": !isSelected && isHovering,
                    })}
                    ellipsize
                >
                    {title}
                </Text>
            );
        },
        [isSelected, title]
    );

    return <SidebarItemLayout title={renderTitle} onClick={handleClick} isSelected={isSelected} />;
};
