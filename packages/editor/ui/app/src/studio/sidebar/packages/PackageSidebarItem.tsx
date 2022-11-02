import { IconNames } from "@blueprintjs/icons";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useCallback } from "react";
import { useApiEditorContext } from "../../../api-editor-context/ApiEditorContext";
import { SidebarItemIdGenerator } from "../ids/SidebarItemIdGenerator";
import { CollapsibleSidebarItemRow } from "../items/CollapsibleSidebarItemRow";

export declare namespace PackageSidebarItem {
    export interface Props {
        package_: FernApiEditor.Package;
        children: CollapsibleSidebarItemRow.Props["children"];
    }
}

export const PackageSidebarItem: React.FC<PackageSidebarItem.Props> = ({ package_, children }) => {
    const { submitTransaction } = useApiEditorContext();

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
            onClickAdd={() => {
                // TODO
            }}
            onRename={onRename}
            defaultIsCollapsed={false}
        >
            {children}
        </CollapsibleSidebarItemRow>
    );
};
