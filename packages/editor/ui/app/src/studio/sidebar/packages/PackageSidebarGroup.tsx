import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useCallback } from "react";
import { useApiEditorContext } from "../../../api-editor-context/ApiEditorContext";
import { usePackage } from "../context/usePackage";
import { useSidebarContext } from "../context/useSidebarContext";
import { EndpointSidebarItem } from "../endpoints/EndpointSidebarItem";
import { ErrorsSidebarGroup } from "../errors/ErrorsSidebarGroup";
import { SidebarIcon } from "../icons/SidebarIcon";
import { DraftSidebarItemRow } from "../items/DraftSidebarItemRow";
import { TypesSidebarGroup } from "../types/TypesSidebarGroup";
import styles from "./PackageSidebarGroup.module.scss";
import { PackageSidebarItem } from "./PackageSidebarItem";

export declare namespace PackageSidebarGroup {
    export interface Props {
        packageId: FernApiEditor.PackageId;
        isRootPackage: boolean;
    }
}

export const PackageSidebarGroup: React.FC<PackageSidebarGroup.Props> = ({ packageId, isRootPackage }) => {
    const { submitTransaction } = useApiEditorContext();
    const package_ = usePackage(packageId);
    const { draft, setDraft } = useSidebarContext();

    const shouldRenderDraft = draft?.type === "package" && draft.parent === packageId;

    const onCreateDraft = useCallback(
        (packageName: string) => {
            setDraft(undefined);
            submitTransaction(
                TransactionGenerator.createPackage({
                    packageId: EditorItemIdGenerator.package(),
                    packageName,
                    parent: packageId,
                })
            );
        },
        [packageId, setDraft, submitTransaction]
    );

    const onCancelDraft = useCallback(() => {
        setDraft(undefined);
    }, [setDraft]);

    return (
        <div className={styles.container}>
            <PackageSidebarItem package_={package_} isRootPackage={isRootPackage}>
                {package_.packages.map((subPackageId) => (
                    <PackageSidebarGroup key={subPackageId} packageId={subPackageId} isRootPackage={false} />
                ))}
                {shouldRenderDraft && (
                    <DraftSidebarItemRow
                        onConfirmName={onCreateDraft}
                        onCancel={onCancelDraft}
                        icon={SidebarIcon.PACKAGE}
                    />
                )}
                {package_.endpoints.map((endpointId) => (
                    <EndpointSidebarItem key={endpointId} endpointId={endpointId} />
                ))}
                <TypesSidebarGroup package_={package_} />
                <ErrorsSidebarGroup package_={package_} />
            </PackageSidebarItem>
        </div>
    );
};
