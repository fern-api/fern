import { createContext } from "react";
import { JsonPropertyPath } from "../../examples/json-example/contexts/JsonPropertyPath";

export const EndpointContext = createContext<() => EndpointContextValue>(() => {
    throw new Error("EndpointContextProvider not found in tree");
});

export interface EndpointContextValue {
    hoveredResponsePropertyPath: JsonPropertyPath | undefined;
    setHoveredResponsePropertyPath: (path: JsonPropertyPath | undefined) => void;
}
