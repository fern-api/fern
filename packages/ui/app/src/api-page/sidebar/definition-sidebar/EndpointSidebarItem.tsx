import { FernRegistry } from "@fern-fern/registry";
import { useCallback } from "react";
import { PackagePath } from "../../../commons/PackagePath";
import { useEndpointPath } from "../../../routes/definition/useEndpointPath";
import { useApiTabsContext } from "../../api-tabs/context/useApiTabsContext";
import { EndpointTitle } from "../../definition/endpoints/EndpointTitle";

export declare namespace EndpointSidebarItem {
    export interface Props {
        endpoint: FernRegistry.EndpointDefinition;
        packagePath: PackagePath;
    }
}

export const EndpointSidebarItem: React.FC<EndpointSidebarItem.Props> = ({ endpoint, packagePath }) => {
    const endpointPath = useEndpointPath(packagePath, endpoint.name);
    const { openTab } = useApiTabsContext();

    const onClick = useCallback(() => {
        openTab(endpointPath);
    }, [openTab, endpointPath]);

    return (
        <div onClick={onClick}>
            <EndpointTitle endpoint={endpoint} />
        </div>
    );
};
