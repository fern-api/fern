import { useContext } from "react";
import { ApiCardLinkContext, ApiCardLinkContextValue } from "./ApiCardLinkContext";

export function useApiCardLinkContext(): ApiCardLinkContextValue {
    return useContext(ApiCardLinkContext)();
}
