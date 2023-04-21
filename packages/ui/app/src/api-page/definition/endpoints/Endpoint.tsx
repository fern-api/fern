import { FernRegistry } from "@fern-fern/registry";
import { EndpointContextProvider } from "./context/EndpointContextProvider";
import { EndpointContent } from "./EndpointContent";

export declare namespace Endpoint {
    export interface Props {
        endpoint: FernRegistry.EndpointDefinition;
    }
}

export const Endpoint: React.FC<Endpoint.Props> = ({ endpoint }) => {
    return (
        <EndpointContextProvider>
            <EndpointContent endpoint={endpoint} />
        </EndpointContextProvider>
    );
};
