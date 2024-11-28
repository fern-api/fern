import { isBrowser } from "./isBrowser";

export interface PathModule {
    sep: string;
    isAbsolute: (value: string) => boolean;
}

export function getPathModule(): PathModule {
    if (isBrowser()) {
        return {
            sep: "/",
            isAbsolute: (value: string): boolean => {
                return value.startsWith("/");
            }
        };
    } else {
        return require("path");
    }
}
