import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { Hit as AlgoliaHit } from "instantsearch.js";

export type SearchRecord = AlgoliaHit<FernRegistryDocsRead.AlgoliaRecord & Record<string, unknown>>;
