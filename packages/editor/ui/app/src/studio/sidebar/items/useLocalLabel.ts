import { useBooleanState } from "@fern-ui/react-commons";
import { useCallback, useEffect, useState } from "react";

export interface LocalLabel {
    value: string;
    set: (newLabel: string) => void;
    isRenaming: boolean;
    onStartRenaming: () => void;
    onCancelRename: () => void;
    onConfirmRename: (newLabel: string) => void;
}

export declare namespace useLocalLabel {
    export interface Args {
        label: string;
        forceIsRenaming: boolean;
        onRename?: (newName: string) => void;
        onCancelRename?: () => void;
    }
}

export function useLocalLabel({ label, forceIsRenaming, onRename, onCancelRename }: useLocalLabel.Args): LocalLabel {
    const [localLabel, setLocalLabel] = useState(label);
    useEffect(() => {
        setLocalLabel(label);
    }, [label]);
    const { value: isRenaming, setValue: setIsRenaming, setTrue: onStartRenaming } = useBooleanState(forceIsRenaming);

    const handleCancelRename = useCallback(() => {
        setLocalLabel(label);
        setIsRenaming(forceIsRenaming);
        onCancelRename?.();
    }, [forceIsRenaming, label, onCancelRename, setIsRenaming]);

    const handleConfirmRename = useCallback(
        (newLabel: string) => {
            setIsRenaming(forceIsRenaming);
            if (newLabel.length === 0) {
                handleCancelRename();
            } else {
                onRename?.(localLabel);
            }
        },
        [forceIsRenaming, handleCancelRename, localLabel, onRename, setIsRenaming]
    );

    return {
        value: localLabel,
        set: setLocalLabel,
        isRenaming,
        onStartRenaming,
        onCancelRename: handleCancelRename,
        onConfirmRename: handleConfirmRename,
    };
}
