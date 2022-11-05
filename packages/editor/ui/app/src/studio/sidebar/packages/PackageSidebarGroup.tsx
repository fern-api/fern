import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React from "react";
import { usePackage } from "../context/usePackage";
import { EndpointsSidebarGroup } from "../endpoints/ErrorsSidebarGroup";
import { ErrorsSidebarGroup } from "../errors/ErrorsSidebarGroup";
import { TypesSidebarGroup } from "../types/TypesSidebarGroup";
import { PackageSidebarItem } from "./PackageSidebarItem";
import { PackagesList } from "./PackagesList";

export declare namespace PackageSidebarGroup {
    export interface Props {
        packageId: FernApiEditor.PackageId;
        parent: FernApiEditor.PackageId | undefined;
    }
}

export const PackageSidebarGroup: React.FC<PackageSidebarGroup.Props> = ({ packageId, parent }) => {
    const package_ = usePackage(packageId);

    return (
        <PackageSidebarItem package_={package_} parent={parent}>
            <PackagesList packages={package_.packages} parent={packageId} />
            <EndpointsSidebarGroup package_={package_} />
            <TypesSidebarGroup package_={package_} />
            <ErrorsSidebarGroup package_={package_} />
        </PackageSidebarItem>
    );
};
