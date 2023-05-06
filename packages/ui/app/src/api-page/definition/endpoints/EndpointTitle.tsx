import { FernRegistry } from "@fern-fern/registry";
import { getEndpointTitleAsString } from "./getEndpointTitleAsString";

export declare namespace EndpointTitle {
    export interface Props {
        endpoint: FernRegistry.EndpointDefinition;
    }
}

export const EndpointTitle: React.FC<EndpointTitle.Props> = ({ endpoint }) => {
    return <>{getEndpointTitleAsString(endpoint)}</>;
};
