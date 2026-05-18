import type * as SeedApi from "../../../index.js";
export interface FileDirectory {
    name: string;
    files?: (SeedApi.objectsWithImports.File_[] | null) | undefined;
    directories?: (SeedApi.objectsWithImports.FileDirectory[] | null) | undefined;
}
