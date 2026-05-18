import type * as SeedApi from "../../../index.js";
export interface Node {
    id: string;
    label?: (string | null) | undefined;
    metadata?: (SeedApi.objectsWithImports.CommonsMetadata | null) | undefined;
}
