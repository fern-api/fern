import { useContext } from "react";
import { ApiTabsContext, ApiTabsContextValue } from "./ApiTabsContext";

export function useApiTabsContext(): ApiTabsContextValue {
    return useContext(ApiTabsContext)();
}
