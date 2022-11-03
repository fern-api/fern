import { EditableText, Icon, Intent, Menu, Text } from "@blueprintjs/core";
import { IconName, IconNames } from "@blueprintjs/icons";
import { ContextMenu2 } from "@blueprintjs/popover2";
import { useBooleanState } from "@fern-ui/react-commons";
import { useIsResizing } from "@fern-ui/split-view";
import classNames from "classnames";
import React, { useCallback, useContext, useEffect } from "react";
import styles from "./BaseSidebarItemRow.module.scss";
import { SidebarItemMenuItem } from "./SidebarItemMenuItem";
import { SidebarItemRowButton } from "./SidebarItemRowButton";
import { SidebarItemRowContext } from "./SidebarItemRowContext";
import { SidebarItemRowEllipsisPopover } from "./SidebarItemRowEllipsisPopover";
import { useIsEffectivelyHovering } from "./useIsEffectivelyHovering";
import { useLocalLabel } from "./useLocalLabel";
import { isEventSelectionPreventing } from "./useSelectionPreventingEventHander";

export declare namespace BaseSidebarItemRow {
    export interface Props {
        // if not defined, label is always in the "editing" state
        label: string | undefined;
        isSelected: boolean;
        leftElement?: JSX.Element;
        icon?: JSX.Element | IconName;
        onClick?: () => void;
        onClickAdd?: () => void;
        onDelete?: () => void;
        onRename?: (newLabel: string) => void;
        onCancelRename?: () => void;
    }
}

export const BaseSidebarItemRow: React.FC<BaseSidebarItemRow.Props> = ({
    leftElement,
    isSelected,
    label,
    icon,
    onClick,
    onClickAdd,
    onDelete,
    onRename,
    onCancelRename,
}) => {
    const { value: isMouseDown, setTrue: onMouseDown, setFalse: onMouseUp } = useBooleanState(false);
    const handleMouseDown = useCallback(
        (event: React.MouseEvent) => {
            if (!isEventSelectionPreventing(event)) {
                onMouseDown();
            }
        },
        [onMouseDown]
    );

    const isResizing = useIsResizing();

    useEffect(() => {
        window.addEventListener("mouseup", onMouseUp);
        return () => {
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [onMouseUp]);

    const handleClick = useCallback(
        (event: React.MouseEvent) => {
            if (!isEventSelectionPreventing(event)) {
                onClick?.();
            }
        },
        [onClick]
    );

    const { indent } = useContext(SidebarItemRowContext);

    const handleDelete = useCallback(() => {
        onDelete?.();
    }, [onDelete]);

    const localLabel = useLocalLabel({
        label,
        onRename,
        onCancelRename,
    });

    const ellipsisMenu = (
        <Menu>
            <SidebarItemMenuItem text="Copy" icon={IconNames.CLIPBOARD} />
            {onRename != null && (
                <SidebarItemMenuItem text="Rename" icon={IconNames.EDIT} onClick={localLabel.onStartRenaming} />
            )}
            {onDelete != null && (
                <SidebarItemMenuItem
                    text="Delete..."
                    icon={IconNames.TRASH}
                    intent={Intent.DANGER}
                    onClick={handleDelete}
                />
            )}
        </Menu>
    );

    const { isHovering, popoverState, popoverProps, onMouseOver, onMouseLeave, onMouseMove } =
        useIsEffectivelyHovering();
    const shouldRenderRightActions = isHovering || popoverState !== "closed";

    return (
        <ContextMenu2 content={ellipsisMenu} popoverProps={popoverProps}>
            <div
                className={styles.wrapper}
                onMouseOver={onMouseOver}
                onMouseLeave={onMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
                onClick={handleClick}
            >
                <div
                    className={classNames(styles.container, {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        [styles.active!]: isMouseDown && !isResizing,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        [styles.hover!]: isHovering,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        [styles.selected!]: isSelected,
                    })}
                    tabIndex={0}
                >
                    <div className={styles.left} style={{ paddingLeft: indent }}>
                        {leftElement}
                        {icon != null &&
                            (typeof icon === "string" ? <Icon className={styles.icon} icon={icon} /> : icon)}
                        <div className={styles.labelSection}>
                            {localLabel.isRenaming ? (
                                <EditableText
                                    className={styles.editableLabel}
                                    value={localLabel.value}
                                    onChange={localLabel.set}
                                    onCancel={localLabel.onCancelRename}
                                    onConfirm={localLabel.onConfirmRename}
                                    isEditing={true}
                                />
                            ) : (
                                <Text className={styles.label} ellipsize>
                                    {localLabel.value}
                                </Text>
                            )}
                        </div>
                    </div>
                    {shouldRenderRightActions && (
                        <div className={styles.right}>
                            {onClickAdd != null && <SidebarItemRowButton icon={IconNames.PLUS} onClick={onClickAdd} />}
                            <SidebarItemRowEllipsisPopover
                                menu={ellipsisMenu}
                                popoverProps={popoverProps}
                                hidden={popoverState === "closing"}
                            />
                        </div>
                    )}
                </div>
            </div>
        </ContextMenu2>
    );
};
