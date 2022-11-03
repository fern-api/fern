import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useCallback, useMemo } from "react";
import { useApiEditorContext } from "../../../api-editor-context/ApiEditorContext";
import { SidebarItemIdGenerator } from "../ids/SidebarItemIdGenerator";
import { CollapsibleSidebarItemRow } from "../items/CollapsibleSidebarItemRow";
import { BasePackageSidebarItem } from "./BasePackageSidebarItem";

export declare namespace PackageSidebarItem {
    export interface Props {
        package_: FernApiEditor.Package;
        isRootPackage: boolean;
        children: CollapsibleSidebarItemRow.Props["children"];
    }
}

export const PackageSidebarItem: React.FC<PackageSidebarItem.Props> = ({ package_, isRootPackage, children }) => {
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

    const onDelete = useCallback(() => {
        submitTransaction(
            TransactionGenerator.deletePackage({
                packageId: package_.packageId,
            })
        );
    }, [package_.packageId, submitTransaction]);

    const sidebarItemId = useMemo(() => SidebarItemIdGenerator.package(package_), [package_]);

    return (
        <BasePackageSidebarItem
            packageId={package_.packageId}
            packageName={package_.packageName}
            sidebarItemId={sidebarItemId}
            isRootPackage={isRootPackage}
            onRename={onRename}
            onDelete={onDelete}
        >
            {children}
        </BasePackageSidebarItem>
    );
};
