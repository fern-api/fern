import { PropsWithChildren, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useImmer } from "use-immer";
import { ApiTabsContext, ApiTabsContextValue, OpenTabOpts, Tab } from "./ApiTabsContext";

interface TabsState {
    ephemeralTabIndex: number | undefined;
    tabs: TabState[];
    selectedTabIndex: number | undefined;
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
        selectedTabIndex: undefined,
        tabs: [],
    });

    const navigate = useNavigate();

    const openTab = useCallback(
        (path: string, { doNotCloseExistingTab = false, makeNewTabEphemeral = false }: OpenTabOpts = {}) => {
            const existingTabIndexForPath = state.tabs.findIndex((tab) => tab.path === path);
            if (existingTabIndexForPath !== -1) {
                setState((draft) => {
                    draft.selectedTabIndex = existingTabIndexForPath;
                });
            } else {
                setState((draft) => {
                    let indexOfNewTab = draft.selectedTabIndex != null ? draft.selectedTabIndex + 1 : 0;

                    if (!doNotCloseExistingTab && draft.ephemeralTabIndex != null) {
                        draft.tabs.splice(draft.ephemeralTabIndex, 1);
                        if (draft.selectedTabIndex != null && draft.ephemeralTabIndex <= draft.selectedTabIndex) {
                            indexOfNewTab--;
                        }
                    }

                    // add new ephemeral tab to the right of the selected tab
                    draft.tabs.splice(indexOfNewTab, 0, { path });
                    draft.ephemeralTabIndex = makeNewTabEphemeral ? indexOfNewTab : undefined;
                    draft.selectedTabIndex = indexOfNewTab;
                });
            }

            // setTimeout is needed to avoid incorrect react-router warning
            // https://github.com/remix-run/react-router/issues/7460#issuecomment-1108818335
            setTimeout(() => {
                navigate(path);
            }, 0);
        },
        [navigate, setState, state.tabs]
    );

    const closeTab = useCallback(
        (path: string) => {
            const index = state.tabs.findIndex((tab) => tab.path === path);

            let indexOfNewSelectedTab = state.selectedTabIndex;
            if (state.selectedTabIndex != null) {
                if (index === state.selectedTabIndex) {
                    if (state.tabs.length === 1) {
                        indexOfNewSelectedTab = undefined;
                    } else if (index === state.tabs.length - 1) {
                        indexOfNewSelectedTab = state.tabs.length - 2;
                    } else {
                        indexOfNewSelectedTab = state.selectedTabIndex + 1;
                    }
                }
            }

            const newTab = indexOfNewSelectedTab != null ? state.tabs[indexOfNewSelectedTab] : undefined;

            setState((draft) => {
                draft.tabs.splice(index, 1);
                draft.selectedTabIndex =
                    newTab != null ? draft.tabs.findIndex((tab) => tab.path === newTab.path) : undefined;
                if (draft.ephemeralTabIndex != null) {
                    if (draft.ephemeralTabIndex === index) {
                        draft.ephemeralTabIndex = undefined;
                    } else if (draft.ephemeralTabIndex > index) {
                        draft.ephemeralTabIndex--;
                    }
                }
            });

            navigate(newTab != null ? newTab.path : noTabsRedirectPath);
        },
        [noTabsRedirectPath, navigate, state.selectedTabIndex, setState, state.tabs]
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

    const contextValue = useCallback((): ApiTabsContextValue => {
        const tabs = state.tabs.map(
            ({ path }, index): Tab => ({
                path,
                isSelected: state.selectedTabIndex === index,
                isEphemeral: state.ephemeralTabIndex === index,
            })
        );

        return {
            tabs,
            selectedTab: state.selectedTabIndex != null ? tabs[state.selectedTabIndex] : undefined,
            openTab,
            closeTab,
            makeTabLongLived,
        };
    }, [closeTab, makeTabLongLived, openTab, state.ephemeralTabIndex, state.selectedTabIndex, state.tabs]);

    return <ApiTabsContext.Provider value={contextValue}>{children}</ApiTabsContext.Provider>;
};
