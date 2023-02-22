import { STOP_PROPAGATION } from "@fern-api/react-commons";
import { PropsWithChildren, useCallback } from "react";
import { useApiCardLinkContext } from "./link-context/useApiCardLinkContext";

export const ApiCardLinkWrapper: React.FC<PropsWithChildren> = ({ children }) => {
    const { setIsHoveringOverLink } = useApiCardLinkContext();

    const onHover = useCallback(() => {
        setIsHoveringOverLink(true);
    }, [setIsHoveringOverLink]);

    const onStopHover = useCallback(() => {
        setIsHoveringOverLink(false);
    }, [setIsHoveringOverLink]);

    return (
        <div className="flex" onClick={STOP_PROPAGATION} onMouseEnter={onHover} onMouseLeave={onStopHover}>
            {children}
        </div>
    );
};
