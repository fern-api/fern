import * as FernRegistryApiRead from "@fern-fern/registry-browser/serialization/resources/api/resources/v1/resources/read";
import { EndpointContextProvider } from "./endpoint-context/EndpointContextProvider";
import { EndpointContent } from "./EndpointContent";

export declare namespace Endpoint {
    export interface Props {
        endpoint: FernRegistryApiRead.EndpointDefinition.Raw;
        slug: string;
    }
}

export const Endpoint: React.FC<Endpoint.Props> = ({ endpoint, slug }) => {
    return (
        <EndpointContextProvider>
            <EndpointContent slug={slug} endpoint={endpoint} />
        </EndpointContextProvider>
    );
};
