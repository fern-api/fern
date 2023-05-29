import { Text } from "@blueprintjs/core";
import classNames from "classnames";
import { useCallback, useEffect, useState } from "react";
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

    const [wasRecentlySelected, setWasRecentlySelected] = useState(isSelected);
    useEffect(() => {
        if (isSelected) {
            setWasRecentlySelected(true);
            return;
        }

        setTimeout(() => {
            setWasRecentlySelected(false);
        }, 0);
    }, [isSelected]);

    const renderTitle = useCallback(
        ({ isHovering }: { isHovering: boolean }) => {
            return (
                <Text
                    className={classNames("select-none", {
                        "text-accentPrimary": isSelected,
                        "text-white": !isSelected && isHovering,
                        transition: !isSelected && !wasRecentlySelected,
                    })}
                    ellipsize
                >
                    {title}
                </Text>
            );
        },
        [isSelected, title, wasRecentlySelected]
    );

    return <SidebarItemLayout title={renderTitle} onClick={handleClick} isSelected={isSelected} />;
};
