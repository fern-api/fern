import { Icon, MenuItemProps } from "@blueprintjs/core";
import { IconName } from "@blueprintjs/icons";
import classNames from "classnames";
import React, { useContext, useMemo } from "react";
import { AddButton } from "../add/AddButton";
import { AddMenuPopover } from "../add/AddMenuPopover";
import { CollapsibleSidebarItemRowContext } from "../collapsible/CollapsibleSidebarItemRowContext";
import { useSidebarItemRowContext } from "../context/SidebarItemRowContext";
import { EllipsisPopover } from "../ellipsis-menu/EllipsisPopover";
import styles from "./BaseSidebarItemRow.module.scss";

export declare namespace BaseSidebarItemRow {
    export interface Props extends ExternalProps {
        label: JSX.Element;
        ellipsisMenu?: JSX.Element;
        onContextMenu: ((event: React.MouseEvent<HTMLDivElement>) => void) | undefined;
        forceHideRightActions?: boolean;
    }

    export interface ExternalProps {
        leftElement?: JSX.Element;
        icon?: JSX.Element | IconName;
        onClickAdd?: MenuItemProps[] | (() => void);
    }
}

export const BaseSidebarItemRow: React.FC<BaseSidebarItemRow.Props> = ({
    leftElement,
    icon,
    onClickAdd,
    label,
    ellipsisMenu,
    onContextMenu,
    forceHideRightActions = false,
}) => {
    const { isSelected, isHovering, isMouseDown, onMouseOver, onMouseLeave, onMouseMove, onMouseDown, onClick } =
        useSidebarItemRowContext();
    const { indent } = useContext(CollapsibleSidebarItemRowContext);
    const shouldRenderRightActions = !forceHideRightActions && isHovering;

    const addButton = useMemo(() => {
        if (onClickAdd == null) {
            return undefined;
        }
        if (typeof onClickAdd === "function") {
            return <AddButton onClick={onClickAdd} hidden={!shouldRenderRightActions} />;
        }
        return <AddMenuPopover items={onClickAdd} hidden={!shouldRenderRightActions} />;
    }, [onClickAdd, shouldRenderRightActions]);

    return (
        <div
            className={styles.wrapper}
            onMouseOver={onMouseOver}
            onMouseLeave={onMouseLeave}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onClick={onClick}
            onContextMenu={onContextMenu}
        >
            <div
                className={classNames(styles.container, {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    [styles.active!]: isMouseDown,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    [styles.hover!]: isHovering,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    [styles.selected!]: isSelected,
                })}
                tabIndex={0}
            >
                <div className={styles.left} style={{ paddingLeft: indent }}>
                    {leftElement}
                    {icon != null && (
                        <div className={styles.icon}>{typeof icon === "string" ? <Icon icon={icon} /> : icon}</div>
                    )}
                    <div className={styles.labelSection}>{label}</div>
                </div>
                <div className={styles.right}>
                    {addButton}
                    {ellipsisMenu != null && <EllipsisPopover menu={ellipsisMenu} hidden={!shouldRenderRightActions} />}
                </div>
            </div>
        </div>
    );
};
