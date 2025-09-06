import * as core from "./index.js";
export declare function mergeHeaders(...headersArray: (Record<string, string | core.Supplier<string | null | undefined> | null | undefined> | null | undefined)[]): Record<string, string | core.Supplier<string | null | undefined>>;
export declare function mergeOnlyDefinedHeaders(...headersArray: (Record<string, string | core.Supplier<string | null | undefined> | null | undefined> | null | undefined)[]): Record<string, string | core.Supplier<string | null | undefined>>;
