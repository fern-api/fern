import { useBooleanState } from "@fern-ui/react-commons";

export declare namespace usePopoverHandlers {
    export interface Return {
        isPopoverOpen: boolean;
        onPopoverInteraction: (isOpen: boolean) => void;
        openPopover: () => void;
        closePopover: () => void;
    }
}

export function usePopoverHandlers(): usePopoverHandlers.Return {
    const {
        value: isPopoverOpen,
        setValue: onPopoverInteraction,
        setTrue: openPopover,
        setFalse: closePopover,
    } = useBooleanState(false);

    return {
        isPopoverOpen,
        openPopover,
        closePopover,
        onPopoverInteraction,
    };
}
