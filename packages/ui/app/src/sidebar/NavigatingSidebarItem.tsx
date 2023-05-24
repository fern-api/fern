import { Text } from "@blueprintjs/core";
import classNames from "classnames";
import { useCallback } from "react";
import { ResolvedUrlPath } from "../docs-context/url-path-resolver/UrlPathResolver";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useIsPathInView } from "../docs-context/useIsPathInView";
import { SidebarItemLayout } from "./SidebarItemLayout";

export declare namespace NavigatingSidebarItem {
    export interface Props {
        title: JSX.Element | string;
        path: ResolvedUrlPath;
    }
}

export const NavigatingSidebarItem: React.FC<NavigatingSidebarItem.Props> = ({ title, path }) => {
    const { navigateToPath } = useDocsContext();
    const handleClick = useCallback(() => {
        navigateToPath(path);
    }, [navigateToPath, path]);

    const isSelected = useIsPathInView(path);

    const renderTitle = useCallback(
        ({ isHovering }: { isHovering: boolean }) => {
            return (
                <Text
                    className={classNames("select-none", {
                        "text-[#B1BCF1]": isSelected,
                        "text-black dark:text-gray-400": !isSelected && isHovering,
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
