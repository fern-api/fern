import { useTimeout } from "@fern-api/react-commons";
import { useMemo, useState } from "react";

export declare namespace useCopyToClipboard {
    export interface Return {
        copyToClipboard: (() => void) | undefined;
        wasJustCopied: boolean;
    }
}

export function useCopyToClipboard(content: string | undefined): useCopyToClipboard.Return {
    const [wasJustCopied, setWasJustCopied] = useState(false);

    const copyToClipboard = useMemo(() => {
        if (content == null) {
            return undefined;
        }
        return async () => {
            setWasJustCopied(true);
            await navigator.clipboard.writeText(content);
        };
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
