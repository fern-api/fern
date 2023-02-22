import React, { PropsWithChildren, useCallback, useState } from "react";
import { ApiCardLinkContext, ApiCardLinkContextValue } from "./ApiCardLinkContext";

export const ApiCardLinkContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [isHoveringOverLink, setIsHoveringOverLink] = useState(false);

    const contextValue = useCallback(
        (): ApiCardLinkContextValue => ({
            isHoveringOverLink,
            setIsHoveringOverLink,
        }),
        [isHoveringOverLink]
    );

    return <ApiCardLinkContext.Provider value={contextValue}>{children}</ApiCardLinkContext.Provider>;
};
