import { type Digit, type UppercaseLetter } from "@fern-api/core-utils";
import { useEffect } from "react";

export declare namespace useKeyboardCommand {
    export interface Args {
        key: UppercaseLetter | Digit;
        platform: "mac" | "windows" | "other";
        onCommand: () => void | Promise<void>;
    }

    export type Return = void;
}

/**
 * Registers a callback that fires on every keyboard command. A keyboard command is a sequence of key
 * events where the first pressed key is cmd (on Mac) or ctrl (on Windows) and the second one is any
 * alphanumeric.
 */
export function useKeyboardCommand(args: useKeyboardCommand.Args): void {
    const { onCommand, key, platform } = args;

    useEffect(() => {
        async function handleSaveKeyPress(e: KeyboardEvent) {
            const isCmdCtrlPressed = (platform === "mac" && e.metaKey) || (platform === "windows" && e.ctrlKey);
            const doKeysMatch = e.code === (typeof key === "string" ? `Key${key}` : `Digit${key}`);
            if (isCmdCtrlPressed && doKeysMatch) {
                e.preventDefault();
                await onCommand();
            }
        }

        document.addEventListener("keydown", handleSaveKeyPress, false);

        return () => {
            document.removeEventListener("keydown", handleSaveKeyPress, false);
        };
    }, [key, onCommand, platform]);
}
