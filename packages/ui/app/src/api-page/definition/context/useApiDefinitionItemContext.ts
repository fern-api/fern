import { useContext } from "react";
import { ApiDefinitionItemContext, ApiDefinitionItemContextValue } from "./ApiDefinitionItemContext";

export function useApiDefinitionItemContext(): ApiDefinitionItemContextValue {
    return useContext(ApiDefinitionItemContext)();
}
