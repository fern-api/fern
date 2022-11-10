import { useBooleanState } from "@fern-ui/react-commons";
import { useCallback } from "react";

export declare namespace usePopoverHandlers {
    export interface Return {
        isPopoverOpen: boolean;
        onPopoverInteraction: (isOpen: boolean, event?: React.SyntheticEvent<HTMLElement>) => void;
        openPopover: () => void;
        closePopover: () => void;
    }
}

export function usePopoverHandlers(): usePopoverHandlers.Return {
    const {
        value: isPopoverOpen,
        setValue: setIsPopoverOpen,
        setTrue: openPopover,
        setFalse: closePopover,
    } = useBooleanState(false);

    return {
        isPopoverOpen,
        openPopover,
        closePopover,
        onPopoverInteraction: useCallback(
            (isOpen, event) => {
                setIsPopoverOpen(isOpen);
                if (isOpen) {
                    // so we don't open outer popovers
                    event?.stopPropagation();
                }
            },
            [setIsPopoverOpen]
        ),
    };
}
