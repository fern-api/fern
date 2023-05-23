import { useContext } from "react";
import { EndpointContext, EndpointContextValue } from "./EndpointContext";

export function useEndpointContext(): EndpointContextValue {
    return useContext(EndpointContext)();
}
