import { createContext } from "react";
import { JsonExampleBreadcrumb } from "./JsonExampleBreadcrumb";

export const JsonExampleBreadcumbsContext = createContext<JsonExampleBreadcumbsContextValue>({
    breadcrumbs: [],
});

export interface JsonExampleBreadcumbsContextValue {
    breadcrumbs: JsonExampleBreadcrumb[];
}
