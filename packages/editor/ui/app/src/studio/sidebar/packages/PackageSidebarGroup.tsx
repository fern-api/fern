import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React from "react";
import { usePackage } from "../context/usePackage";
import { useSidebarContext } from "../context/useSidebarContext";
import { EndpointSidebarItem } from "../endpoints/EndpointSidebarItem";
import { ErrorsSidebarGroup } from "../errors/ErrorsSidebarGroup";
import { TypesSidebarGroup } from "../types/TypesSidebarGroup";
import styles from "./PackageSidebarGroup.module.scss";
import { PackageSidebarItem } from "./PackageSidebarItem";

export declare namespace PackageSidebarGroup {
    export interface Props {
        packageId: FernApiEditor.PackageId;
        isRootPackage: boolean;
        isDraft?: boolean;
    }
}

export const PackageSidebarGroup: React.FC<PackageSidebarGroup.Props> = ({ packageId, isRootPackage, isDraft }) => {
    const package_ = usePackage(packageId);
    const { draft } = useSidebarContext();

    return (
        <div className={styles.container}>
            <PackageSidebarItem package_={package_} isRootPackage={isRootPackage}>
                {package_.packages.map((subPackageId) => (
                    <PackageSidebarGroup key={subPackageId} packageId={subPackageId} isRootPackage={false} />
                ))}
                {!isDraft && draft?.type === "package" && (
                    <PackageSidebarGroup
                        key={draft.packageId}
                        packageId={draft.packageId}
                        isRootPackage={false}
                        isDraft={true}
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
