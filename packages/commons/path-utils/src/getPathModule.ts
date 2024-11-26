import { isBrowser } from "./isBrowser";

export function getPathModule() {
    if (isBrowser()) {
        return {
            isAbsolutePath: (value: string): boolean => {
                return value.startsWith("/");
            }
        };
    } else {
        return require("path");
    }
}
