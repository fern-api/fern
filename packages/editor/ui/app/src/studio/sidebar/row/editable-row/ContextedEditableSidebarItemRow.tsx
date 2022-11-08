import { EditableText, Menu } from "@blueprintjs/core";
import { ContextMenu2 } from "@blueprintjs/popover2";
import { PREVENT_DEFAULT, useLocalTextState } from "@fern-ui/react-commons";
import React, { useCallback, useMemo } from "react";
import { useSidebarContext } from "../../context/useSidebarContext";
import { BaseSidebarItemRow } from "../base-row/BaseSidebarItemRow";
import { useSidebarItemRowContext } from "../context/SidebarItemRowContext";
import { useEllipsisMenuItems } from "../ellipsis-menu/useEllipsisMenuItems";
import { SidebarItemLabel } from "../label/SidebarItemLabel";
import { markEventAsSelectionPreventing } from "../utils/markEventAsSelectionPreventing";
import styles from "./ContextedEditableSidebarItemRow.module.scss";

export declare namespace ContextedEditableSidebarItemRow {
    export interface Props extends BaseSidebarItemRow.ExternalProps {
        label: string;
        onDelete?: () => void;
        onRename?: (newLabel: string) => void;
        isDraft: boolean;
        placeholder: string;
    }
}

export const ContextedEditableSidebarItemRow: React.FC<ContextedEditableSidebarItemRow.Props> = ({
    label,
    onDelete,
    onRename,
    isDraft,
    placeholder,
    ...baseRowProps
}) => {
    const { popoverProps } = useSidebarItemRowContext();

    const { setDraft } = useSidebarContext();
    const onCancelRename = useCallback(() => {
        if (isDraft) {
            setDraft(undefined);
        }
    }, [isDraft, setDraft]);

    const localLabel = useLocalTextState({
        persistedValue: label,
        onRename,
        onCancelRename,
        defaultIsRenaming: isDraft,
    });

    const onClickRenameMenuItem = useMemo(() => {
        if (onRename == null) {
            return undefined;
        }
        return () => {
            localLabel.onEdit(undefined);
        };
    }, [localLabel, onRename]);

    const ellipsisMenuItems = useEllipsisMenuItems({
        startRenaming: onClickRenameMenuItem,
        onDelete,
    });

    const ellipsisMenu = ellipsisMenuItems.length > 0 ? <Menu>{ellipsisMenuItems}</Menu> : undefined;

    const labelElement =
        localLabel.isEditing || localLabel.value.length === 0 ? (
            <div className={styles.editableLabelWrapper} onClick={markEventAsSelectionPreventing}>
                <EditableText {...localLabel} className={styles.editableLabel} placeholder={placeholder} />
            </div>
        ) : (
            <SidebarItemLabel label={localLabel.value} />
        );

    return (
        <ContextMenu2 content={ellipsisMenu} popoverProps={popoverProps}>
            <BaseSidebarItemRow
                {...baseRowProps}
                label={labelElement}
                ellipsisMenu={ellipsisMenu}
                onContextMenu={ellipsisMenu == null ? PREVENT_DEFAULT : undefined}
                forceHideRightActions={localLabel.isEditing}
            />
        </ContextMenu2>
    );
};
