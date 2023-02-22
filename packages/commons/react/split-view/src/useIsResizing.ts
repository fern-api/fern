import { useContext } from "react";
import { SplitViewContext } from "./SplitViewProvider";

export function useIsResizing(): boolean {
    const value = useContext(SplitViewContext);
    return value != null ? value.isResizing : false;
}
