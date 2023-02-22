import { useCallback, useMemo } from "react";
import { OpenTabOpts } from "./ApiTabsContext";
import { useApiTabsContext } from "./useApiTabsContext";

export declare namespace useApiTab {
    export interface Return {
        isSelected: boolean;
        openTab: (opts?: OpenTabOpts) => void;
        closeTab: () => void;
        makeTabLongLived: () => void;
    }
}

export function useApiTab(path: string): useApiTab.Return {
    const { tabs, openTab, closeTab, makeTabLongLived } = useApiTabsContext();

    const tab = useMemo(() => tabs.find((t) => t.path === path), [path, tabs]);

    return {
        isSelected: tab != null && tab.isSelected,
        openTab: useCallback((opts) => openTab(path, opts), [openTab, path]),
        closeTab: useCallback(() => closeTab(path), [closeTab, path]),
        makeTabLongLived: useCallback(() => makeTabLongLived(path), [makeTabLongLived, path]),
    };
}
