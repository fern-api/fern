import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { EndpointId, PackagePath } from "../../context/ApiContext";
import { EndpointTitle } from "../../definition/endpoints/EndpointTitle";
import { SidebarItem } from "./SidebarItem";

export declare namespace EndpointSidebarItem {
    export interface Props {
        endpoint: FernRegistry.EndpointDefinition;
        packagePath: PackagePath;
        endpointIndex: number;
    }
}

export const EndpointSidebarItem: React.FC<EndpointSidebarItem.Props> = ({ endpoint, packagePath, endpointIndex }) => {
    const endpointId = useMemo(
        (): EndpointId => ({
            type: "endpoint",
            packagePath,
            indexInParent: endpointIndex,
        }),
        [endpointIndex, packagePath]
    );

    return <SidebarItem label={<EndpointTitle endpoint={endpoint} />} sidebarItemId={endpointId} />;
};
