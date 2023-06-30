import { Hit as AlgoliaHit } from "instantsearch.js";

// TODO: Import the type from our sdk
export type SearchRecord = AlgoliaHit<{
    type: "endpoint";
    title: string;
    subtitle: string;
    path: string;
}>;
