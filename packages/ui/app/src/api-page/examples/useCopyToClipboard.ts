import { useTimeout } from "@fern-api/react-commons";
import { useCallback, useState } from "react";

export declare namespace useCopyToClipboard {
    export interface Return {
        copyToClipboard: () => void;
        wasJustCopied: boolean;
    }
}

export function useCopyToClipboard(content: string): useCopyToClipboard.Return {
    const [wasJustCopied, setWasJustCopied] = useState(false);

    const copyToClipboard = useCallback(async () => {
        setWasJustCopied(true);
        await navigator.clipboard.writeText(content);
    }, [content]);

    useTimeout(
        () => {
            setWasJustCopied(false);
        },
        wasJustCopied ? 2_000 : undefined
    );

    return {
        copyToClipboard,
        wasJustCopied,
    };
}
