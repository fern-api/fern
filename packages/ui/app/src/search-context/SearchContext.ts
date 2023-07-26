import { createContext } from "react";

export const SearchContext = createContext<() => SearchContextValue>(() => {
    throw new Error("SearchContextValueProvider is not present in this tree.");
});

export interface SearchContextValue {
    isSearchDialogOpen: boolean;
    openSearchDialog: () => void;
    closeSearchDialog: () => void;
}
