import algolia, { type SearchClient } from "algoliasearch/lite";
import { useDocsContext } from "../docs-context/useDocsContext";

export type SearchService =
    | {
          isAvailable: true;
          client: SearchClient;
          index: string;
      }
    | {
          isAvailable: false;
      };

if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || !process.env.NEXT_PUBLIC_ALGOLIA_API_KEY) {
    // TODO: Move this validation elsewhere
    throw new Error("Missing Algolia variables.");
}

const client = algolia(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, process.env.NEXT_PUBLIC_ALGOLIA_API_KEY);

export function useSearchService(): SearchService {
    const { docsDefinition } = useDocsContext();
    const { algoliaSearchIndex } = docsDefinition;
    if (algoliaSearchIndex) {
        return {
            isAvailable: true,
            index: algoliaSearchIndex,
            client,
        };
    }
    return { isAvailable: false };
}
