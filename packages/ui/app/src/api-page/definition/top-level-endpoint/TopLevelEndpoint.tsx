import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { Endpoint } from "../endpoints/Endpoint";

export declare namespace TopLevelEndpoint {
    export interface Props {
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }
}

export const TopLevelEndpoint: React.FC<Endpoint.Props> = ({ endpoint }) => {
    return (
        <div className="min-h-0 overflow-y-auto">
            <Endpoint endpoint={endpoint} />
        </div>
    );
};
