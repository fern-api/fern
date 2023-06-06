import { createContext } from "react";

export const JsonPropertySelectionContext = createContext<JsonPropertySelectionContextValue>({
    isSelected: false,
});

export interface JsonPropertySelectionContextValue {
    isSelected: boolean;
}
