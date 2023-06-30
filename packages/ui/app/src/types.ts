import { Hit as AlgoliaHit } from "instantsearch.js";

// TODO: Import the type from our sdk
export type SearchRecord = AlgoliaHit<{
    title: string;
    subtitle: string;
    path: string;
}>;
