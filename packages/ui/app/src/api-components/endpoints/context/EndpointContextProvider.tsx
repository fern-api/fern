import { useCallback, useState } from "react";
import { JsonPropertyPath } from "../../examples/json-example/contexts/JsonPropertyPath";
import { EndpointContext, EndpointContextValue } from "./EndpointContext";

export const EndpointContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [hoveredResponsePropertyPath, setHoveredResponsePropertyPath] = useState<JsonPropertyPath | undefined>();

    const contextValue = useCallback(
        (): EndpointContextValue => ({
            hoveredResponsePropertyPath,
            setHoveredResponsePropertyPath,
        }),
        [hoveredResponsePropertyPath]
    );

    return <EndpointContext.Provider value={contextValue}>{children}</EndpointContext.Provider>;
};
