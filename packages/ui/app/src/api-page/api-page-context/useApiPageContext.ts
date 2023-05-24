import { useContext } from "react";
import { ApiPageContext, ApiPageContextValue } from "./ApiPageContext";

export function useApiPageContext(): ApiPageContextValue {
    return useContext(ApiPageContext)();
}
