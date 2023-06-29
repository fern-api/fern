import { type Digit, type UppercaseLetter } from "@fern-api/core-utils";
import { useEffect } from "react";
import { getPlatform } from "../utils/platform";

/**
 * Registers a callback that fires on every keyboard command. A keyboard command is a sequence of key
 * events where the first pressed key is cmd (on Mac) or ctrl (on Windows) and the second one is any
 * alphanumeric.
 */
export function useKeyboardCommand(key: UppercaseLetter | Digit, callback: () => void | Promise<void>): void {
    useEffect(() => {
        async function handleSaveKeyPress(e: KeyboardEvent) {
            const platform = getPlatform();
            const isCmdCtrlPressed = (platform === "mac" && e.metaKey) || (platform === "windows" && e.ctrlKey);
            const doKeysMatch = e.code === (typeof key === "string" ? `Key${key}` : `Digit${key}`);
            if (isCmdCtrlPressed && doKeysMatch) {
                e.preventDefault();
                await callback();
            }
        }

        document.addEventListener("keydown", handleSaveKeyPress, false);

        return () => {
            document.removeEventListener("keydown", handleSaveKeyPress, false);
        };
    }, [key, callback]);
}
