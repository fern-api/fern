import { useContext } from "react";
import { DocsContext, DocsContextValue } from "./DocsContext";

export function useDocsContext(): DocsContextValue {
    return useContext(DocsContext)();
}
