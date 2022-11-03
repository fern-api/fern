import { noop } from "@fern-api/core-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import { useCallback, useEffect, useState } from "react";

export interface LocalLabel {
    value: string;
    set: (newLabel: string) => void;
    isRenaming: boolean;
    onStartRenaming: () => void;
    onCancelRename: () => void;
    onConfirmRename: () => void;
}

export declare namespace useLocalLabel {
    export interface Args {
        label: string | undefined;
        onRename?: (newName: string) => void;
        onCancelRename?: () => void;
    }
}

export function useLocalLabel({ label, onRename, onCancelRename }: useLocalLabel.Args): LocalLabel {
    const [localLabel, setLocalLabel] = useState(label ?? "");
    useEffect(() => {
        setLocalLabel(label ?? "");
    }, [label]);

    const { isRenaming, setIsRenaming, onStartRenaming: handleStartRenaming } = useIsRenaming({ label });

    const handleCancelRename = useCallback(() => {
        setLocalLabel(label ?? "");
        setIsRenaming(false);
        onCancelRename?.();
    }, [label, onCancelRename, setIsRenaming]);

    const handleConfirmRename = useCallback(() => {
        setIsRenaming(false);
        onRename?.(localLabel);
    }, [localLabel, onRename, setIsRenaming]);

    return {
        value: localLabel,
        set: setLocalLabel,
        isRenaming,
        onStartRenaming: handleStartRenaming,
        onCancelRename: handleCancelRename,
        onConfirmRename: localLabel.length > 0 ? handleConfirmRename : handleCancelRename,
    };
}

function useIsRenaming({ label }: { label: string | undefined }): {
    isRenaming: boolean;
    setIsRenaming: (isRenaming: boolean) => void;
    onStartRenaming: () => void;
} {
    const { value: isRenaming, setValue: setIsRenaming, setTrue: onStartRenaming } = useBooleanState(false);

    if (label == null) {
        return {
            isRenaming: true,
            setIsRenaming: noop,
            onStartRenaming: noop,
        };
    }

    return {
        isRenaming,
        setIsRenaming,
        onStartRenaming,
    };
}
