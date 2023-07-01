import { useInfiniteHits } from "react-instantsearch-hooks-web";
import type { SearchRecord } from "../types";
import { SearchHit } from "./SearchHit";

export const SearchHits: React.FC = () => {
    const { hits } = useInfiniteHits<SearchRecord>();

    return (
        <div className="max-h-72 overflow-y-auto p-2">
            {hits.map((hit) => (
                <SearchHit key={hit.objectID} hit={hit} />
            ))}
        </div>
    );
};
