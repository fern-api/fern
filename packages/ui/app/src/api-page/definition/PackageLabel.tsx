import { H1 } from "@blueprintjs/core";
import { FernRegistry } from "@fern-fern/registry";
import { getAnchorForSidebarItem } from "../anchor-links/getAnchorForSidebarItem";
import { PackageId } from "../context/ApiContext";
import { useTrackSidebarItemId } from "./useTrackSidebarItemId";

export declare namespace PackageLabel {
    export interface Props {
        package: FernRegistry.ApiDefinitionSubpackage;
        packageId: PackageId;
    }
}

export const PackageLabel: React.FC<PackageLabel.Props> = ({ package: package_, packageId }) => {
    const ref = useTrackSidebarItemId(packageId);

    return (
        <H1 elementRef={ref} id={getAnchorForSidebarItem(packageId)}>
            {package_.displayName ?? "<Package>"}
        </H1>
    );
};
