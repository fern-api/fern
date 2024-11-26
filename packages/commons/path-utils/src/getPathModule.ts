import { isBrowser } from "./isBrowser";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
