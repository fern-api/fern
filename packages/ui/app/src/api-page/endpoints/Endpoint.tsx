import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useApiPageCenterElement } from "../useApiPageCenterElement";
import { EndpointContextProvider } from "./endpoint-context/EndpointContextProvider";
import { EndpointContent } from "./EndpointContent";

export declare namespace Endpoint {
    export interface Props {
        endpoint: FernRegistryApiRead.EndpointDefinition;
        slug: string;
    }
}

export const Endpoint: React.FC<Endpoint.Props> = ({ endpoint, slug }) => {
    const { setTargetRef } = useApiPageCenterElement({ slug });

    return (
        <EndpointContextProvider>
            <EndpointContent endpoint={endpoint} setContainerRef={setTargetRef} />
        </EndpointContextProvider>
    );
};
