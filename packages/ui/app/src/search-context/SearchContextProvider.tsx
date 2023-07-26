import { useBooleanState } from "@fern-api/react-commons";
import { PropsWithChildren, useCallback } from "react";
import { SearchContext, SearchContextValue } from "./SearchContext";

export declare namespace SearchContextProvider {
    export type Props = PropsWithChildren<{
        // ...
    }>;
}

export const SearchContextProvider: React.FC<SearchContextProvider.Props> = ({ children }) => {
    const {
        value: isSearchDialogOpen,
        setTrue: openSearchDialog,
        setFalse: closeSearchDialog,
    } = useBooleanState(false);

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
