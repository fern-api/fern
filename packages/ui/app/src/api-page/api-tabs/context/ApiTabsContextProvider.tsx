import { PropsWithChildren, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useImmer } from "use-immer";
import { ApiTabsContext, ApiTabsContextValue } from "./ApiTabsContext";

interface TabsState {
    ephemeralTabIndex: number | undefined;
    tabs: TabState[];
}

interface TabState {
    path: string;
}

export const ApiTabsContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [state, setState] = useImmer<TabsState>({
        ephemeralTabIndex: undefined,
        tabs: [],
    });

    const navigate = useNavigate();
    const location = useLocation();

    const selectedTabIndex = state.tabs.findIndex((tab) => tab.path === location.pathname);

    useEffect(() => {
        if (selectedTabIndex === -1) {
            setState((draft) => {
                draft.ephemeralTabIndex =
                    draft.tabs.push({
                        path: location.pathname,
                    }) - 1;
            });
        }
    }, [location.pathname, selectedTabIndex, setState]);

    const openTab = useCallback(
        (path: string) => {
            const existingTabIndexForPath = state.tabs.findIndex((tab) => tab.path === path);
            if (existingTabIndexForPath === -1) {
                setState((draft) => {
                    let indexOfNewTab = selectedTabIndex + 1;

                    // delete emphemeral tab
                    if (draft.ephemeralTabIndex != null) {
                        draft.tabs.splice(draft.ephemeralTabIndex, 1);
                        if (draft.ephemeralTabIndex <= selectedTabIndex) {
                            indexOfNewTab--;
                        }
                    }

                    // add new ephemeral tab to the right of the selected tab
                    draft.tabs.splice(indexOfNewTab, 0, { path });
                    draft.ephemeralTabIndex = indexOfNewTab;
                });
            }

            navigate(path);
        },
        [navigate, selectedTabIndex, setState, state.tabs]
    );

    const closeTab = useCallback(
        (index: number) => {
            // if deleting the selected tab, switch to the next tab.
            // if deleting the last tab, switch to the previous tab
            if (index === selectedTabIndex) {
                const indexOfNewSelectedTab = index < state.tabs.length - 1 ? index + 1 : index - 1;
                const newTab = state.tabs[indexOfNewSelectedTab];
                if (newTab != null) {
                    navigate(newTab.path);
                } else {
                    // TODO reset url
                }
            }

            setState((draft) => {
                draft.tabs.splice(index, 1);
                if (draft.ephemeralTabIndex === index) {
                    draft.ephemeralTabIndex = undefined;
                }
            });
        },
        [navigate, selectedTabIndex, setState, state.tabs]
    );

    const makeTabLongLived = useCallback(
        (path: string) => {
            const indexOfTab = state.tabs.findIndex((tab) => tab.path === path);
            if (state.ephemeralTabIndex === indexOfTab) {
                setState((draft) => {
                    draft.ephemeralTabIndex = undefined;
                });
            }
        },
        [setState, state.ephemeralTabIndex, state.tabs]
    );

    const contextValue = useCallback(
        (): ApiTabsContextValue => ({
            tabs: state.tabs.map(({ path }, index) => ({
                path,
                isSelected: selectedTabIndex === index,
                isEphemeral: state.ephemeralTabIndex === index,
            })),
            openTab,
            closeTab,
            makeTabLongLived,
        }),
        [closeTab, makeTabLongLived, openTab, selectedTabIndex, state.ephemeralTabIndex, state.tabs]
    );

    return <ApiTabsContext.Provider value={contextValue}>{children}</ApiTabsContext.Provider>;
};
