import { IconNames } from "@blueprintjs/icons";
import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useCallback } from "react";
import { useApiEditorContext } from "../../../api-editor-context/ApiEditorContext";
import { SidebarItemIdGenerator } from "../ids/SidebarItemIdGenerator";
import { CollapsibleSidebarItemRow } from "../items/CollapsibleSidebarItemRow";

export declare namespace PackageSidebarItem {
    export interface Props {
        package_: FernApiEditor.Package;
        isRootPackage: boolean;
        children: CollapsibleSidebarItemRow.Props["children"];
    }
}

export const PackageSidebarItem: React.FC<PackageSidebarItem.Props> = ({ package_, isRootPackage, children }) => {
    const { submitTransaction } = useApiEditorContext();

    const onClickAdd = useCallback(() => {
        submitTransaction(
            TransactionGenerator.createPackage({
                packageId: EditorItemIdGenerator.package(),
                packageName: "New sub-package",
                parent: package_.packageId,
            })
        );
    }, [package_.packageId, submitTransaction]);

    const onRename = useCallback(
        (newPackageName: string) => {
            submitTransaction(
                TransactionGenerator.renamePackage({
                    packageId: package_.packageId,
                    newPackageName,
                })
            );
        },
        [package_.packageId, submitTransaction]
    );

    return (
        <CollapsibleSidebarItemRow
            itemId={SidebarItemIdGenerator.package(package_.packageId)}
            label={package_.packageName}
            icon={IconNames.BOX}
            onClickAdd={onClickAdd}
            onRename={onRename}
            defaultIsCollapsed={!isRootPackage}
        >
            {children}
        </CollapsibleSidebarItemRow>
    );
};
