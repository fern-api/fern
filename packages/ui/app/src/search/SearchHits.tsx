import classNames from "classnames";
import { PropsWithChildren, useEffect, useState } from "react";
import { useInfiniteHits, useInstantSearch } from "react-instantsearch-hooks-web";
import type { SearchRecord } from "../types";
import { visitDiscriminatedUnion } from "../utils/visitDiscriminatedUnion";
import { SearchHit } from "./SearchHit";

type Progress = "nil" | "error" | "pending" | "success";

export const EmptyStateView: React.FC<PropsWithChildren> = ({ children }) => {
    return <div className="text-text-default justify flex h-24 w-full flex-col items-center py-3">{children}</div>;
};

export const SearchHits: React.FC = () => {
    const { hits } = useInfiniteHits<SearchRecord>();
    const search = useInstantSearch();
    const [progress, setProgress] = useState<Progress>("nil");

    useEffect(() => {
        switch (search.status) {
            case "idle":
                setProgress("success");
                break;
            case "stalled":
            case "loading":
                setProgress("pending");
                break;
            case "error":
                setProgress("error");
        }
    }, [search.status]);

    const results = hits.map((hit) => <SearchHit key={hit.objectID} hit={hit} />);

    return (
        <div
            className={classNames("max-h-80 overflow-y-auto p-2", {
                "border-border border-t": (progress === "success" || progress === "pending") && results.length > 0,
            })}
        >
            {visitDiscriminatedUnion({ progress }, "progress")._visit({
                pending: () => results,
                error: () => (
                    <EmptyStateView>An unexpected error has occurred while loading the results.</EmptyStateView>
                ),
                nil: () => null,
                success: () => {
                    if (hits.length === 0) {
                        return <EmptyStateView>No results</EmptyStateView>;
                    }
                    return results;
                },
                _other: () => null,
            })}
        </div>
    );
};
