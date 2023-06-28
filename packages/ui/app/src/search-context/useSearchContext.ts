import { useContext } from "react";
import { SearchContext, type SearchContextValue } from "./SearchContext";

export function useSearchContext(): SearchContextValue {
    return useContext(SearchContext)();
}
