import { EditableText, Icon, Intent, Menu, MenuItem, Text } from "@blueprintjs/core";
import { IconName, IconNames } from "@blueprintjs/icons";
import { ContextMenu2, ContextMenu2Props } from "@blueprintjs/popover2";
import { useBooleanState, useIsHovering } from "@fern-ui/react-commons";
import { useIsResizing } from "@fern-ui/split-view";
import classNames from "classnames";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SidebarItemId } from "../context/SidebarContext";
import { useSidebarContext } from "../context/useSidebarContext";
import styles from "./SidebarItemRow.module.scss";
import { SidebarItemRowButton, SIDEBAR_ITEM_ROW_BUTTON_PROPERTY } from "./SidebarItemRowButton";
import { SidebarItemRowContext } from "./SidebarItemRowContext";
import { SidebarItemRowEllipsisPopover } from "./SidebarItemRowEllipsisPopover";

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
            if (!isEventFromButton(event)) {
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

    const sidebarContext = useSidebarContext();
    const onClick = useCallback(
        (event: React.MouseEvent) => {
            if (!isEventFromButton(event)) {
                sidebarContext.setSelectedItem(itemId);
            }
        },
        [itemId, sidebarContext]
    );
    const isSelected = sidebarContext.selectedItem === itemId;

    const { indent } = useContext(SidebarItemRowContext);

    const handleDelete = useCallback(() => {
        if (isSelected) {
            sidebarContext.setSelectedItem(undefined);
        }
        onDelete?.();
    }, [isSelected, onDelete, sidebarContext]);

    const [localLabel, setLocalLabel] = useState(label);
    useEffect(() => {
        setLocalLabel(label);
    }, [label]);
    const { value: isRenaming, setValue: setIsRenaming, setTrue: onStartRenaming } = useBooleanState(false);

    const onCancelRename = useCallback(() => {
        setLocalLabel(label);
        setIsRenaming(false);
    }, [label, setIsRenaming]);

    const onConfirmRename = useCallback(() => {
        setIsRenaming(false);
        onRename?.(localLabel);
    }, [localLabel, onRename, setIsRenaming]);

    const ellipsisMenu = (
        <Menu>
            <MenuItem text="Copy" icon={IconNames.CLIPBOARD} />
            {onRename != null && <MenuItem text="Rename" icon={IconNames.EDIT} onClick={onStartRenaming} />}
            {onDelete != null && (
                <MenuItem text="Delete..." icon={IconNames.TRASH} intent={Intent.DANGER} onClick={handleDelete} />
            )}
        </Menu>
    );

    const [popoverState, setPopoverState] = useState<"open" | "closing" | "closed">("closed");
    const popoverProps = useMemo(
        (): ContextMenu2Props["popoverProps"] => ({
            onOpening: () => setPopoverState("open"),
            onClosing: () => setPopoverState("closing"),
            onClosed: () => setPopoverState("closed"),
        }),
        []
    );

    const { isHovering, onMouseEnter, onMouseLeave } = useIsHovering();
    const isEffectivelyHovering = popoverState === "open" || (isHovering && !isResizing);

    // render the right actions (which can contain the popover) while the popover is opening or closing
    const shouldRenderRightActions = isEffectivelyHovering || popoverState !== "closed";

    return (
        <ContextMenu2 content={ellipsisMenu} popoverProps={popoverProps}>
            <div
                className={styles.wrapper}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseUp={onMouseUp}
                onClick={onClick}
            >
                <div
                    className={classNames(styles.container, {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        [styles.active!]: isMouseDown && !isResizing,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        [styles.hover!]: isEffectivelyHovering,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        [styles.selected!]: isSelected,
                    })}
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    style={{ paddingLeft: getDefaultPaddingLeft() + indent }}
                    tabIndex={0}
                >
                    <div className={styles.left}>
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
                            <SidebarItemRowEllipsisPopover
                                menu={ellipsisMenu}
                                popoverProps={popoverProps}
                                hidden={popoverState === "closing"}
                            />
                            {onClickAdd != null && <SidebarItemRowButton icon={IconNames.PLUS} onClick={onClickAdd} />}
                        </div>
                    )}
                </div>
            </div>
        </ContextMenu2>
    );
};

const PX_REGEX = /(.*)px/;
function getDefaultPaddingLeft(): number {
    const defaultPaddingLeftString = styles.paddingLeft;
    if (defaultPaddingLeftString == null) {
        return 0;
    }
    const defaultPaddingLeftWithoutPx = defaultPaddingLeftString.match(PX_REGEX);
    if (defaultPaddingLeftWithoutPx == null) {
        return 0;
    }
    const defaultPaddingLeft = Number(defaultPaddingLeftWithoutPx[1]);
    if (isNaN(defaultPaddingLeft)) {
        return 0;
    }
    return defaultPaddingLeft;
}

function isEventFromButton(event: React.MouseEvent) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (event as any)[SIDEBAR_ITEM_ROW_BUTTON_PROPERTY] != null;
}
