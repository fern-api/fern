import { PropsWithChildren, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useImmer } from "use-immer";
import { ApiTabsContext, ApiTabsContextValue, OpenTabOpts } from "./ApiTabsContext";

interface TabsState {
    ephemeralTabIndex: number | undefined;
    tabs: TabState[];
}

interface TabState {
    path: string;
}

export declare namespace ApiTabsContextProvider {
    export type Props = PropsWithChildren<{
        /**
         * this is the path we redirect to when the last tab is closed
         */
        noTabsRedirectPath: string;
    }>;
}

export const ApiTabsContextProvider: React.FC<ApiTabsContextProvider.Props> = ({ noTabsRedirectPath, children }) => {
    const [state, setState] = useImmer<TabsState>({
        ephemeralTabIndex: undefined,
        tabs: [],
    });

    const navigate = useNavigate();
    const location = useLocation();

    const selectedTabIndex = state.tabs.findIndex((tab) => tab.path === location.pathname);

    const openTab = useCallback(
        (path: string, { doNotCloseExistingTab = false, makeNewTabEphemeral = false }: OpenTabOpts = {}) => {
            const existingTabIndexForPath = state.tabs.findIndex((tab) => tab.path === path);
            if (existingTabIndexForPath === -1) {
                setState((draft) => {
                    let indexOfNewTab = selectedTabIndex + 1;

                    if (!doNotCloseExistingTab && draft.ephemeralTabIndex != null) {
                        draft.tabs.splice(draft.ephemeralTabIndex, 1);
                        if (draft.ephemeralTabIndex <= selectedTabIndex) {
                            indexOfNewTab--;
                        }
                    }

                    // add new ephemeral tab to the right of the selected tab
                    draft.tabs.splice(indexOfNewTab, 0, { path });
                    draft.ephemeralTabIndex = makeNewTabEphemeral ? indexOfNewTab : undefined;
                });
            }

            // setTimeout is needed to avoid incorrect react-router warning
            // https://github.com/remix-run/react-router/issues/7460#issuecomment-1108818335
            setTimeout(() => {
                navigate(path);
            }, 0);
        },
        [navigate, selectedTabIndex, setState, state.tabs]
    );

    const closeTab = useCallback(
        (path: string) => {
            const index = state.tabs.findIndex((tab) => tab.path === path);

            // if deleting the selected tab, switch to the next tab.
            // if deleting the last tab, switch to the previous tab
            if (index === selectedTabIndex) {
                const indexOfNewSelectedTab = index < state.tabs.length - 1 ? index + 1 : index - 1;
                const newTab = state.tabs[indexOfNewSelectedTab];
                navigate(newTab != null ? newTab.path : noTabsRedirectPath);
            }

            setState((draft) => {
                draft.tabs.splice(index, 1);
                if (draft.ephemeralTabIndex != null) {
                    if (draft.ephemeralTabIndex === index) {
                        draft.ephemeralTabIndex = undefined;
                    } else if (draft.ephemeralTabIndex > index) {
                        draft.ephemeralTabIndex--;
                    }
                }
            });
        },
        [noTabsRedirectPath, navigate, selectedTabIndex, setState, state.tabs]
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
