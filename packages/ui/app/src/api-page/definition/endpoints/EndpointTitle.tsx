import { FernRegistry } from "@fern-fern/registry";
import { EndpointPath } from "./EndpointPath";

export declare namespace EndpointTitle {
    export interface Props {
        endpoint: FernRegistry.EndpointDefinition;
        className?: string;
    }
}

export const EndpointTitle: React.FC<EndpointTitle.Props> = ({ endpoint, className }) => {
    if (endpoint.displayName != null) {
        return <span className={className}>{endpoint.displayName}</span>;
    } else {
        return <EndpointPath endpoint={endpoint} className={className} />;
    }
};
