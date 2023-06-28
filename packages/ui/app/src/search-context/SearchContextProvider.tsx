import { PropsWithChildren, useCallback, useState } from "react";
import { SearchContext, SearchContextValue } from "./SearchContext";

export declare namespace SearchContextProvider {
    export type Props = PropsWithChildren<{
        // ...
    }>;
}

export const SearchContextProvider: React.FC<SearchContextProvider.Props> = ({ children }) => {
    const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);

    const openSearchDialog = useCallback(() => {
        setIsSearchDialogOpen(true);
    }, []);

    const closeSearchDialog = useCallback(() => {
        setIsSearchDialogOpen(false);
    }, []);

    const contextValue = useCallback(
        (): SearchContextValue => ({
            isSearchDialogOpen,
            openSearchDialog,
            closeSearchDialog,
        }),
        [isSearchDialogOpen, openSearchDialog, closeSearchDialog]
    );

    return <SearchContext.Provider value={contextValue}>{children}</SearchContext.Provider>;
};
