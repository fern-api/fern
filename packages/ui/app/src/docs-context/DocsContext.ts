import { DocsDefinition } from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import React from "react";

export const DocsContext = React.createContext<() => DocsContextValue>(() => {
    throw new Error("DocsContextValueProvider is not present in this tree.");
});

export interface DocsContextValue {
    docsDefinition: DocsDefinition;
}
