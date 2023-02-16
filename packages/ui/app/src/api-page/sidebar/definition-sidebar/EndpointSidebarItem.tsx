import { FernRegistry } from "@fern-fern/registry";
import { EndpointTitle } from "../../definition/endpoints/EndpointTitle";

export declare namespace EndpointSidebarItem {
    export interface Props {
        endpoint: FernRegistry.EndpointDefinition;
    }
}

export const EndpointSidebarItem: React.FC<EndpointSidebarItem.Props> = ({ endpoint }) => {
    return <EndpointTitle endpoint={endpoint} />;
};
