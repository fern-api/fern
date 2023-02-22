import React from "react";

export const ApiCardLinkContext = React.createContext((): ApiCardLinkContextValue => {
    throw new Error("ApiCardLinkContextProvider not found in tree");
});

export interface ApiCardLinkContextValue {
    isHoveringOverLink: boolean;
    setIsHoveringOverLink: (isHovering: boolean) => void;
}
