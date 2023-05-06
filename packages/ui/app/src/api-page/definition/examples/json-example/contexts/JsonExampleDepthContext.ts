import { createContext } from "react";

export const JsonExampleDepthContext = createContext<JsonExampleDepthContextValue>({
    depth: 0,
});

export interface JsonExampleDepthContextValue {
    depth: number;
}
