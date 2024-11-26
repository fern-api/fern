import { isBrowser } from "./isBrowser";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getPathModule() {
    if (isBrowser()) {
        return {
            isAbsolute: (value: string): boolean => {
                return value.startsWith("/");
            }
        };
    } else {
        return require("path");
    }
}
