import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useCallback } from "react";
import { useSidebarContext } from "../context/useSidebarContext";
import { SidebarIcon } from "../icons/SidebarIcon";
import { PackageSidebarItemId } from "../ids/SidebarItemId";
import { CollapsibleSidebarItemRow } from "../items/CollapsibleSidebarItemRow";

export declare namespace BasePackageSidebarItem {
    export interface Props {
        packageId: FernApiEditor.PackageId;
        packageName: string | undefined;
        sidebarItemId: PackageSidebarItemId;
        isRootPackage: boolean;
        onRename?: (newName: string) => void;
        onCancelRename?: () => void;
        onDelete?: () => void;
        children?: CollapsibleSidebarItemRow.Props["children"];
    }
}

export const BasePackageSidebarItem: React.FC<BasePackageSidebarItem.Props> = ({
    packageId,
    packageName,
    sidebarItemId,
    isRootPackage,
    onRename,
    onCancelRename,
    onDelete,
    children,
}) => {
    const { setDraft } = useSidebarContext();

    const onClickAdd = useCallback(() => {
        setDraft({
            type: "package",
            packageId: EditorItemIdGenerator.package(),
            parent: packageId,
        });
    }, [packageId, setDraft]);

    return (
        <CollapsibleSidebarItemRow
            itemId={sidebarItemId}
            label={packageName}
            icon={SidebarIcon.PACKAGE}
            onClickAdd={onClickAdd}
            onRename={onRename}
            onCancelRename={onCancelRename}
            onDelete={onDelete}
            defaultIsCollapsed={!isRootPackage}
        >
            {children}
        </CollapsibleSidebarItemRow>
    );
};
