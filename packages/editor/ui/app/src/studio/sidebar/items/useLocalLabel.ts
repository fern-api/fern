import { useBooleanState } from "@fern-ui/react-commons";
import { useCallback, useEffect, useState } from "react";

export declare namespace useLocalLabel {
    export interface Args {
        label: string;
        onRename?: (newName: string) => void;
    }

    export interface Return {
        localLabel: string;
        setLocalLabel: (newLabel: string) => void;
        isRenaming: boolean;
        onStartRenaming: () => void;
        onCancelRename: () => void;
        onConfirmRename: () => void;
    }
}

export function useLocalLabel({ label, onRename }: useLocalLabel.Args): useLocalLabel.Return {
    const [localLabel, setLocalLabel] = useState(label);
    useEffect(() => {
        setLocalLabel(label);
    }, [label]);
    const { value: isRenaming, setValue: setIsRenaming, setTrue: onStartRenaming } = useBooleanState(false);

    const onCancelRename = useCallback(() => {
        setLocalLabel(label);
        setIsRenaming(false);
    }, [label, setIsRenaming]);

    const onConfirmRename = useCallback(() => {
        setIsRenaming(false);
        onRename?.(localLabel);
    }, [localLabel, onRename, setIsRenaming]);

    return {
        localLabel,
        setLocalLabel,
        isRenaming,
        onStartRenaming,
        onCancelRename,
        onConfirmRename,
    };
}
