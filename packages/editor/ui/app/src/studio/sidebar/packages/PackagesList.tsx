import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useMemo } from "react";
import { useSidebarContext } from "../context/useSidebarContext";
import { PackageSidebarGroup } from "./PackageSidebarGroup";

export declare namespace PackagesList {
    export interface Props {
        packages: FernApiEditor.PackageId[];
        parent: FernApiEditor.PackageId | undefined;
    }
}

export const PackagesList: React.FC<PackagesList.Props> = ({ packages, parent }) => {
    const { draft } = useSidebarContext();

    // we put the subpackages all in an array together, so that React gracefully
    // handles when a packages turns from draft to persisted
    const packagesList = useMemo(() => {
        const elements = packages.map((subPackageId) => (
            <PackageSidebarGroup key={subPackageId} packageId={subPackageId} parent={parent} />
        ));
        if (draft?.type === "package" && draft.parent === parent) {
            elements.push(<PackageSidebarGroup key={draft.packageId} packageId={draft.packageId} parent={parent} />);
        }
        return elements;
    }, [draft, packages, parent]);

    return <>{packagesList}</>;
};
