import { isBrowser } from "./isBrowser";

export interface PathModule {
    isAbsolute: (value: string) => boolean;
}

export function getPathModule(): PathModule {
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
