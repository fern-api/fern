import { Text } from "@blueprintjs/core";
import classNames from "classnames";
import { useCallback } from "react";
import { getAnchorForSidebarItem } from "../../anchor-links/getAnchorForSidebarItem";
import { SidebarItemId } from "../../context/ApiContext";
import { areSidebarItemIdsEqual } from "../../context/areSidebarItemIdsEqual";
import { useApiContext } from "../../context/useApiContext";
import styles from "./SidebarItem.module.scss";

export declare namespace SidebarItem {
    export interface Props {
        label: JSX.Element | string;
        sidebarItemId: SidebarItemId;
    }
}

export const SidebarItem: React.FC<SidebarItem.Props> = ({ label, sidebarItemId }) => {
    const { focusedSidebarItem } = useApiContext();
    const isFocused = focusedSidebarItem != null && areSidebarItemIdsEqual(sidebarItemId, focusedSidebarItem);

    const onClick = useCallback(() => {
        window.location.hash = `#${getAnchorForSidebarItem(sidebarItemId)}`;
    }, [sidebarItemId]);

    return (
        <div
            className={classNames(styles.container, {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                [styles.isFocused!]: isFocused,
            })}
            onClick={onClick}
        >
            <Text className={styles.label} ellipsize>
                {label}
            </Text>
        </div>
    );
};
