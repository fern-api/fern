import { Text } from "@blueprintjs/core";
import classNames from "classnames";
import { useCallback, useEffect, useState } from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useIsSlugSelected } from "../docs-context/useIsSlugSelected";
import { SidebarItemLayout } from "./SidebarItemLayout";

export declare namespace NavigatingSidebarItem {
    export interface Props {
        title: JSX.Element | string;
        icon?: JSX.Element;
        slug: string;
    }
}

export const NavigatingSidebarItem: React.FC<NavigatingSidebarItem.Props> = ({ title, icon, slug }) => {
    const { navigateToPath, registerScrolledToPathListener } = useDocsContext();
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
                <div className="flex items-center gap-2">
                    {icon != null && (
                        <div className="text-text-muted/70 flex items-center justify-center text-lg">{icon}</div>
                    )}
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
                </div>
            );
        },
        [icon, isSelected, title, wasRecentlySelected]
    );

    const [ref, setRef] = useState<HTMLElement | null>(null);
    useEffect(() => {
        if (ref == null) {
            return;
        }
        const unsubscribe = registerScrolledToPathListener(slug, () => {
            ref.scrollIntoView({
                block: "center",
            });
        });
        return unsubscribe;
    }, [ref, registerScrolledToPathListener, slug]);

    return (
        <div ref={setRef}>
            <SidebarItemLayout title={renderTitle} onClick={handleClick} isSelected={isSelected} />
        </div>
    );
};
