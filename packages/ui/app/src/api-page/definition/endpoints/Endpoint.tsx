import { FernRegistry } from "@fern-fern/registry";
import { ResolvedUrlPath } from "../../api-context/url-path-resolver/UrlPathResolver";
import { EndpointContextProvider } from "./context/EndpointContextProvider";
import { EndpointContent } from "./EndpointContent";

export declare namespace Endpoint {
    export interface Props {
        resolvedUrlPath: ResolvedUrlPath;
        endpoint: FernRegistry.EndpointDefinition;
    }
}

export const Endpoint: React.FC<Endpoint.Props> = ({ resolvedUrlPath, endpoint }) => {
    return (
        <EndpointContextProvider>
            <EndpointContent resolvedUrlPath={resolvedUrlPath} endpoint={endpoint} />
        </EndpointContextProvider>
    );
};
