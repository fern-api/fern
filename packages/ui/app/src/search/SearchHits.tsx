import classNames from "classnames";
import { useInfiniteHits } from "react-instantsearch-hooks-web";
import type { SearchRecord } from "../types";
import { SearchHit } from "./SearchHit";

export const SearchHits: React.FC = () => {
    const { hits } = useInfiniteHits<SearchRecord>();

    return (
        <div
            className={classNames("max-h-80 overflow-y-auto p-2", {
                "border-border border-t": hits.length > 0,
            })}
        >
            {hits.length === 0 ? (
                <div className="text-text-default justify flex h-24 w-full flex-col items-center py-3">No results</div>
            ) : (
                hits.map((hit) => <SearchHit key={hit.objectID} hit={hit} />)
            )}
        </div>
    );
};
