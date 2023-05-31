import { createContext, useContext } from "react";
import { JsonPropertyPath } from "./JsonPropertyPath";

export const JsonExampleContext = createContext<() => JsonExampleContextValue>(() => {
    throw new Error("JsonExampleContext.Provider not found in tree.");
});

export interface JsonExampleContextValue {
    selectedProperty: JsonPropertyPath | undefined;
    containerRef: HTMLElement | undefined;
}

export function useJsonExampleContext(): JsonExampleContextValue {
    return useContext(JsonExampleContext)();
}
