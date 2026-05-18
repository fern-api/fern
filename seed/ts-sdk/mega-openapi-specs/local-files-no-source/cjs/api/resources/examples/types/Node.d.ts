import type * as SeedApi from "../../../index.js";
export interface Node {
    name: string;
    nodes?: (SeedApi.examples.Node[] | null) | undefined;
    trees?: (SeedApi.examples.Tree[] | null) | undefined;
}
