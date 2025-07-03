import * as core from "./index.js";
export declare function mergeHeaders(...headersArray: (Record<string, string | core.Supplier<string | undefined> | undefined> | undefined)[]): Record<string, string | core.Supplier<string | undefined>>;
export declare function mergeOnlyDefinedHeaders(...headersArray: (Record<string, string | core.Supplier<string | undefined> | undefined> | undefined)[]): Record<string, string | core.Supplier<string | undefined>>;
