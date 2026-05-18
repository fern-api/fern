import type * as SeedApi from "../../../index.mjs";
export interface Directory {
    name: string;
    files?: (SeedApi.examples.File_[] | null) | undefined;
    directories?: (SeedApi.examples.Directory[] | null) | undefined;
}
