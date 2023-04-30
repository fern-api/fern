import { EndpointContextProvider } from "./context/EndpointContextProvider";
import { EndpointContent } from "./EndpointContent";

export declare namespace Endpoint {
    export type Props = EndpointContent.Props;
}

export const Endpoint: React.FC<Endpoint.Props> = ({ ...endpointProps }) => {
    return (
        <EndpointContextProvider>
            <EndpointContent {...endpointProps} />
        </EndpointContextProvider>
    );
};
