import React from "react";

const PREVENT_SELECTION = Symbol();

type MaybeSelectionPreventingEvent = React.SyntheticEvent & {
    [PREVENT_SELECTION]?: true;
};

export function markEventAsSelectionPreventing(event: React.SyntheticEvent): void {
    (event as MaybeSelectionPreventingEvent)[PREVENT_SELECTION] = true;
}

export function isEventSelectionPreventing(event: React.SyntheticEvent): boolean {
    return (event as MaybeSelectionPreventingEvent)[PREVENT_SELECTION] != null;
}
