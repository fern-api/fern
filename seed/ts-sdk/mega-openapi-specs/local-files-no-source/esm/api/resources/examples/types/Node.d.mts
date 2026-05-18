import type * as SeedApi from "../../../index.mjs";
export interface Node {
    name: string;
    nodes?: (SeedApi.examples.Node[] | null) | undefined;
    trees?: (SeedApi.examples.Tree[] | null) | undefined;
}
