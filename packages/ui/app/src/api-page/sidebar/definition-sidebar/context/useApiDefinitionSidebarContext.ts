import { useContext } from "react";
import { ApiDefinitionSidebarContext, ApiDefinitionSidebarContextValue } from "./ApiDefinitionSidebarContext";

export function useApiDefinitionSidebarContext(): ApiDefinitionSidebarContextValue {
    return useContext(ApiDefinitionSidebarContext)();
}
