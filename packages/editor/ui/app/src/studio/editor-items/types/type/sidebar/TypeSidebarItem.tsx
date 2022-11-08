import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useMemo } from "react";
import { SidebarItemIdGenerator } from "../../../../sidebar/ids/SidebarItemIdGenerator";
import { EditableSidebarItemRow } from "../../../../sidebar/row/editable-row/EditableSidebarItemRow";
import { TYPE_NAME_PLACEHOLDER } from "../placeholder";
import { TypeIcon } from "../TypeIcon";
import { useEditTypeCallbacks } from "./useEditTypeCallbacks";
import { useMaybeDraftType } from "./useMaybeDraftType";

export declare namespace TypeSidebarItem {
    export interface Props {
        typeId: FernApiEditor.TypeId;
        parent: FernApiEditor.PackageId;
    }
}

export const TypeSidebarItem: React.FC<TypeSidebarItem.Props> = ({ typeId, parent }) => {
    const type = useMaybeDraftType(typeId);
    const { onDelete, onRename, isDraft } = useEditTypeCallbacks({ typeId, parent });
    const sidebarItemId = useMemo(() => SidebarItemIdGenerator.type(type), [type]);

    return (
        <EditableSidebarItemRow
            itemId={sidebarItemId}
            label={type.isDraft ? "" : type.typeName}
            icon={<TypeIcon />}
            onDelete={onDelete}
            onRename={onRename}
            isDraft={isDraft}
            placeholder={TYPE_NAME_PLACEHOLDER}
        />
    );
};
