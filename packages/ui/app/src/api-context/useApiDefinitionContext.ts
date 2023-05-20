import { useContext } from "react";
import { ApiDefinitionContext, ApiDefinitionContextValue } from "./ApiDefinitionContext";

export function useApiDefinitionContext(): ApiDefinitionContextValue {
    return useContext(ApiDefinitionContext)();
}
