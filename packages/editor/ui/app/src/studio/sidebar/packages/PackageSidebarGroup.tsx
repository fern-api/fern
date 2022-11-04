import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useMemo } from "react";
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
    }
}

export const PackageSidebarGroup: React.FC<PackageSidebarGroup.Props> = ({ packageId, isRootPackage }) => {
    const package_ = usePackage(packageId);
    const { draft } = useSidebarContext();

    // we put the subpackages all in an array together, so that React gracefully
    // handles when a packages turns from draft to persisted
    const subPackages = useMemo(() => {
        const elements = package_.packages.map((subPackageId) => (
            <PackageSidebarGroup key={subPackageId} packageId={subPackageId} isRootPackage={false} />
        ));
        if (draft?.type === "package" && draft.parent === packageId) {
            elements.push(
                <PackageSidebarGroup key={draft.packageId} packageId={draft.packageId} isRootPackage={false} />
            );
        }
        return elements;
    }, [draft, packageId, package_.packages]);

    return (
        <div className={styles.container}>
            <PackageSidebarItem package_={package_} isRootPackage={isRootPackage}>
                {subPackages}
                {package_.endpoints.map((endpointId) => (
                    <EndpointSidebarItem key={endpointId} endpointId={endpointId} />
                ))}
                <TypesSidebarGroup package_={package_} />
                <ErrorsSidebarGroup package_={package_} />
            </PackageSidebarItem>
        </div>
    );
};
