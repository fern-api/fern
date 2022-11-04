import { EditableText, Icon, Intent, Menu, Text } from "@blueprintjs/core";
import { IconName, IconNames } from "@blueprintjs/icons";
import { ContextMenu2 } from "@blueprintjs/popover2";
import { useBooleanState } from "@fern-ui/react-commons";
import { useIsResizing } from "@fern-ui/split-view";
import classNames from "classnames";
import React, { useCallback, useContext, useEffect, useMemo } from "react";
import { useSelectedSidebarItemId } from "../../routes/useSelectedSidebarItemId";
import { useSidebarContext } from "../context/useSidebarContext";
import { SidebarItemId } from "../ids/SidebarItemId";
import { StringifiedSidebarItemId } from "../ids/StringifiedSidebarItemId";
import { isEventSelectionPreventing, markEventAsSelectionPreventing } from "./markEventAsSelectionPreventing";
import { SidebarItemMenuItem } from "./SidebarItemMenuItem";
import styles from "./SidebarItemRow.module.scss";
import { SidebarItemRowButton } from "./SidebarItemRowButton";
import { SidebarItemRowContext } from "./SidebarItemRowContext";
import { SidebarItemRowEllipsisPopover } from "./SidebarItemRowEllipsisPopover";
import { useIsEffectivelyHovering } from "./useIsEffectivelyHovering";
import { useLocalLabel } from "./useLocalLabel";

export declare namespace SidebarItemRow {
    export interface Props {
        itemId: SidebarItemId;
        label: string;
        leftElement?: JSX.Element;
        icon?: JSX.Element | IconName;
        onClickAdd?: () => void;
        onDelete?: () => void;
        onRename?: (newLabel: string) => void;
        isDraft: boolean;
    }
}

export const SidebarItemRow: React.FC<SidebarItemRow.Props> = ({
    itemId,
    leftElement,
    label,
    icon,
    onClickAdd,
    onDelete,
    onRename,
    isDraft,
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

    const [selectedSidebarItemId, setSelectedSidebarItemId] = useSelectedSidebarItemId();
    const onClick = useCallback(
        (event: React.MouseEvent) => {
            if (!isEventSelectionPreventing(event)) {
                setSelectedSidebarItemId(itemId);
            }
        },
        [itemId, setSelectedSidebarItemId]
    );
    const isSelected =
        selectedSidebarItemId != null &&
        StringifiedSidebarItemId.stringify(selectedSidebarItemId) === StringifiedSidebarItemId.stringify(itemId);

    const { indent } = useContext(SidebarItemRowContext);

    const handleDelete = useCallback(() => {
        onDelete?.();
    }, [onDelete]);

    const { setDraft } = useSidebarContext();
    const onCancelRename = useCallback(() => {
        if (isDraft) {
            setDraft(undefined);
        }
    }, [isDraft, setDraft]);

    const localLabel = useLocalLabel({
        label,
        onRename,
        onCancelRename,
        forceIsRenaming: isDraft,
    });

    const ellipsisMenuItems = useMemo(() => {
        const items: JSX.Element[] = [];
        if (onRename != null) {
            items.push(
                <SidebarItemMenuItem
                    key="rename"
                    text="Rename"
                    icon={IconNames.EDIT}
                    onClick={localLabel.onStartRenaming}
                />
            );
        }
        if (onDelete != null) {
            items.push(
                <SidebarItemMenuItem
                    key="delete"
                    text="Delete..."
                    icon={IconNames.TRASH}
                    intent={Intent.DANGER}
                    onClick={handleDelete}
                />
            );
        }
        return items;
    }, [handleDelete, localLabel.onStartRenaming, onDelete, onRename]);

    const ellipsisMenu = ellipsisMenuItems.length > 0 ? <Menu>{ellipsisMenuItems}</Menu> : undefined;

    const { isHovering, popoverState, popoverProps, onMouseOver, onMouseLeave, onMouseMove } =
        useIsEffectivelyHovering();
    const shouldRenderRightActions = !localLabel.isRenaming && (isHovering || popoverState !== "closed");

    const rowElement = (
        <div
            className={styles.wrapper}
            onMouseOver={onMouseOver}
            onMouseLeave={onMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            onClick={onClick}
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
                    {icon != null && (
                        <div className={styles.icon}>{typeof icon === "string" ? <Icon icon={icon} /> : icon}</div>
                    )}
                    <div className={styles.labelSection}>
                        {localLabel.shouldRenderEditableText ? (
                            <div className={styles.editableLabelWrapper} onClick={markEventAsSelectionPreventing}>
                                <EditableText
                                    className={styles.editableLabel}
                                    value={localLabel.value}
                                    onChange={localLabel.set}
                                    onCancel={localLabel.onCancelRename}
                                    onConfirm={localLabel.onConfirmRename}
                                    isEditing={localLabel.isRenaming}
                                    placeholder="Untitled"
                                />
                            </div>
                        ) : (
                            <Text className={styles.label} ellipsize>
                                {localLabel.value}
                            </Text>
                        )}
                    </div>
                </div>
                <div className={styles.right}>
                    {onClickAdd != null && (
                        <SidebarItemRowButton
                            icon={IconNames.PLUS}
                            onClick={onClickAdd}
                            hidden={!shouldRenderRightActions}
                        />
                    )}
                    {ellipsisMenu != null && (
                        <SidebarItemRowEllipsisPopover
                            menu={ellipsisMenu}
                            popoverProps={popoverProps}
                            hidden={!shouldRenderRightActions}
                        />
                    )}
                </div>
            </div>
        </div>
    );

    if (ellipsisMenu == null) {
        return rowElement;
    }

    return (
        <ContextMenu2 content={ellipsisMenu} popoverProps={popoverProps}>
            {rowElement}
        </ContextMenu2>
    );
};
