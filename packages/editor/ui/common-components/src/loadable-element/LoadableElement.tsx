import { isFailed, isLoaded, Loadable } from "@fern-api/loadable";
import React from "react";

export declare namespace LoadableElement {
    export interface Props<T> {
        value: Loadable<T>;
        children: (loadedValue: T) => JSX.Element | string | null;
        fallback?: JSX.Element;
        errorElement?: JSX.Element | string;
    }
}

export function LoadableElement<T>({
    value,
    children,
    fallback = <React.Fragment />,
    errorElement = fallback,
}: LoadableElement.Props<T>): JSX.Element {
    if (isFailed(value)) {
        return <>{errorElement}</>;
    }
    if (!isLoaded(value)) {
        return fallback;
    }
    return <>{children(value.value)}</>;
}
