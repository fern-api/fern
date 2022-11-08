import { EMPTY_ARRAY } from "@fern-api/core-utils";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React from "react";
import { EndpointsSidebarList } from "../../../endpoints/endpoints-list/EndpointsSidebarList";
import { ErrorsSidebarGroup } from "../../../errors/errors-group/sidebar/ErrorsSidebarGroup";
import { TypesSidebarGroup } from "../../../types/types-group/sidebar/TypesSidebarGroup";
import { PackagesList } from "../../packages-list/PackagesList";
import { PackageSidebarItem } from "./PackageSidebarItem";
import { useMaybeDraftPackage } from "./useMaybeDraftPackage";

export declare namespace PackageSidebarGroup {
    export interface Props {
        packageId: FernApiEditor.PackageId;
        parent: FernApiEditor.PackageId | undefined;
    }
}

export const PackageSidebarGroup: React.FC<PackageSidebarGroup.Props> = ({ packageId, parent }) => {
    const package_ = useMaybeDraftPackage(packageId);

    return (
        <PackageSidebarItem package_={package_} parent={parent}>
            <PackagesList packages={package_.isDraft ? EMPTY_ARRAY : package_.packages} parent={packageId} />
            <EndpointsSidebarList package_={package_} />
            <TypesSidebarGroup package_={package_} />
            <ErrorsSidebarGroup package_={package_} />
        </PackageSidebarItem>
    );
};
