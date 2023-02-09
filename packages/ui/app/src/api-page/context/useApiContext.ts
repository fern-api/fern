import { useContext } from "react";
import { ApiContext, ApiContextValue } from "./ApiContext";

export function useApiContext(): ApiContextValue {
    return useContext(ApiContext)();
}
