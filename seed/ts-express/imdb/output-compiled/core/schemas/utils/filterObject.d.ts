export declare function filterObject<T extends {}, K extends keyof T>(obj: T, keysToInclude: K[]): Pick<T, K>;
