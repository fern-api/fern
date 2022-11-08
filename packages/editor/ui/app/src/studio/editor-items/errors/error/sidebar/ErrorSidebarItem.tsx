import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useMemo } from "react";
import { SidebarItemIdGenerator } from "../../../../sidebar/ids/SidebarItemIdGenerator";
import { EditableSidebarItemRow } from "../../../../sidebar/row/editable-row/EditableSidebarItemRow";
import { ErrorIcon } from "../ErrorIcon";
import { useEditErrorCallbacks } from "./useEditErrorCallbacks";
import { useMaybeDraftError } from "./useMaybeDraftError";

export declare namespace ErrorSidebarItem {
    export interface Props {
        errorId: FernApiEditor.ErrorId;
        parent: FernApiEditor.PackageId;
    }
}

export const ErrorSidebarItem: React.FC<ErrorSidebarItem.Props> = ({ errorId, parent }) => {
    const error = useMaybeDraftError(errorId);

    const { onDelete, onRename, isDraft } = useEditErrorCallbacks({
        errorId,
        parent,
    });

    const sidebarItemId = useMemo(() => SidebarItemIdGenerator.error(error), [error]);

    return (
        <EditableSidebarItemRow
            itemId={sidebarItemId}
            label={error.isDraft ? "" : error.errorName}
            icon={<ErrorIcon />}
            onDelete={onDelete}
            onRename={onRename}
            isDraft={isDraft}
            placeholder="Untitled error"
        />
    );
};
