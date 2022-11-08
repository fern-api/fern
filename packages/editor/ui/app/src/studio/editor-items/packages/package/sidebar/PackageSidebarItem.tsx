import { MenuItemProps } from "@blueprintjs/core";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useCallback, useMemo } from "react";
import { MaybeDraftPackage } from "../../../../sidebar/drafts/DraftableItem";
import { SidebarItemIdGenerator } from "../../../../sidebar/ids/SidebarItemIdGenerator";
import { CollapsibleSidebarItemRow } from "../../../../sidebar/row/collapsible/CollapsibleSidebarItemRow";
import { EditableSidebarItemRow } from "../../../../sidebar/row/editable-row/EditableSidebarItemRow";
import { EndpointIcon } from "../../../endpoints/endpoint/EndpointIcon";
import { useCreateEndpointCallback } from "../../../endpoints/endpoint/sidebar/useCreateEndpointCallback";
import { ErrorIcon } from "../../../errors/error/ErrorIcon";
import { useCreateErrorCallback } from "../../../errors/errors-group/sidebar/useCreateErrorCallback";
import { TypeIcon } from "../../../types/type/TypeIcon";
import { useCreateTypeCallback } from "../../../types/types-group/sidebar/useCreateTypeCallback";
import { PackageIcon } from "../PackageIcon";
import { useCreateSubPackageCallback } from "./useCreateSubPackageCallback";
import { useEditPackageCallbacks } from "./useEditPackageCallbacks";

export declare namespace PackageSidebarItem {
    export interface Props {
        package_: MaybeDraftPackage;
        parent: FernApiEditor.PackageId | undefined;
        children: CollapsibleSidebarItemRow.Props["children"];
    }
}

export const PackageSidebarItem: React.FC<PackageSidebarItem.Props> = ({ package_, parent, children }) => {
    const { onDelete, onRename, isDraft } = useEditPackageCallbacks({
        packageId: package_.packageId,
        parent,
    });

    const sidebarItemId = useMemo(() => SidebarItemIdGenerator.package(package_), [package_]);
    const isRootPackage = parent == null;

    const onClickAddPackage = useCreateSubPackageCallback({ parent: package_ });
    const onClickAddEndpoint = useCreateEndpointCallback({ package_ });
    const onClickAddType = useCreateTypeCallback({ package_ });
    const onClickAddError = useCreateErrorCallback({ package_ });
    const addMenuItems = useMemo(
        (): MenuItemProps[] => [
            { text: "Add package", onClick: onClickAddPackage, icon: <PackageIcon /> },
            { text: "Add endpoint", onClick: onClickAddEndpoint, icon: <EndpointIcon /> },
            { text: "Add type", onClick: onClickAddType, icon: <TypeIcon /> },
            { text: "Add error", onClick: onClickAddError, icon: <ErrorIcon /> },
        ],
        [onClickAddEndpoint, onClickAddError, onClickAddPackage, onClickAddType]
    );

    const renderRow = useCallback(
        ({ leftElement }: { leftElement: JSX.Element }) => {
            return (
                <EditableSidebarItemRow
                    itemId={sidebarItemId}
                    leftElement={leftElement}
                    label={package_.isDraft ? "" : package_.packageName}
                    icon={<PackageIcon />}
                    onClickAdd={addMenuItems}
                    onRename={onRename}
                    onDelete={onDelete}
                    isDraft={isDraft}
                    placeholder="Untitled package"
                />
            );
        },
        [addMenuItems, isDraft, onDelete, onRename, package_, sidebarItemId]
    );

    return (
        <CollapsibleSidebarItemRow itemId={sidebarItemId} defaultIsCollapsed={!isRootPackage} renderRow={renderRow}>
            {children}
        </CollapsibleSidebarItemRow>
    );
};
