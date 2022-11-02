import { EditableText, Icon, Intent, Menu, Text } from "@blueprintjs/core";
import { IconName, IconNames } from "@blueprintjs/icons";
import { ContextMenu2 } from "@blueprintjs/popover2";
import { useBooleanState } from "@fern-ui/react-commons";
import { useIsResizing } from "@fern-ui/split-view";
import classNames from "classnames";
import React, { useCallback, useContext, useEffect } from "react";
import { useSelectedSidebarItemId } from "../../routes/useSelectedSidebarItemId";
import { SidebarItemId } from "../ids/SidebarItemId";
import { SidebarItemMenuItem } from "./SidebarItemMenuItem";
import styles from "./SidebarItemRow.module.scss";
import { SidebarItemRowButton } from "./SidebarItemRowButton";
import { SidebarItemRowContext } from "./SidebarItemRowContext";
import { SidebarItemRowEllipsisPopover } from "./SidebarItemRowEllipsisPopover";
import { useIsEffectivelyHovering } from "./useIsEffectivelyHovering";
import { useLocalLabel } from "./useLocalLabel";
import { isEventSelectionPreventing } from "./useSelectionPreventingEventHander";

export declare namespace SidebarItemRow {
    export interface Props {
        itemId: SidebarItemId;
        label: string;
        leftElement?: JSX.Element;
        icon?: JSX.Element | IconName;
        onClickAdd?: () => void;
        onDelete?: () => void;
        onRename?: (newLabel: string) => void;
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
    const isSelected = selectedSidebarItemId === itemId;

    const { indent } = useContext(SidebarItemRowContext);

    const handleDelete = useCallback(() => {
        if (isSelected) {
            setSelectedSidebarItemId(undefined);
        }
        onDelete?.();
    }, [isSelected, onDelete, setSelectedSidebarItemId]);

    const { localLabel, setLocalLabel, isRenaming, onStartRenaming, onCancelRename, onConfirmRename } = useLocalLabel({
        label,
        onRename,
    });

    const ellipsisMenu = (
        <Menu>
            <SidebarItemMenuItem text="Copy" icon={IconNames.CLIPBOARD} />
            {onRename != null && <SidebarItemMenuItem text="Rename" icon={IconNames.EDIT} onClick={onStartRenaming} />}
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
                        {icon != null && (typeof icon === "string" ? <Icon icon={icon} /> : icon)}
                        <div className={styles.labelSection}>
                            {isRenaming ? (
                                <EditableText
                                    className={styles.editableLabel}
                                    value={localLabel}
                                    onChange={setLocalLabel}
                                    onCancel={onCancelRename}
                                    onConfirm={onConfirmRename}
                                    isEditing={true}
                                />
                            ) : (
                                <Text className={styles.label} ellipsize>
                                    {localLabel}
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
