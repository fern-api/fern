import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { getEndpointTitleAsString } from "./getEndpointTitleAsString";

export declare namespace EndpointTitle {
    export interface Props {
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }
}

export const EndpointTitle: React.FC<EndpointTitle.Props> = ({ endpoint }) => {
    return <>{getEndpointTitleAsString(endpoint)}</>;
};
