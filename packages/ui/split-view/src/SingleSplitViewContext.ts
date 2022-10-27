import { createContext } from "react";
import { Orientation } from "./types";

export const SingleSplitViewContext = createContext<() => SingleSplitViewContextValue>(() => {
    throw new Error("You cannot render a Pane outside of a SplitView!");
});

export interface SingleSplitViewContextValue {
    orientation: Orientation;
    containerSizeInPixels: number | undefined;
    disabled: boolean;
}
