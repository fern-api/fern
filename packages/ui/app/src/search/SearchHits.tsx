import classNames from "classnames";
import React, { PropsWithChildren, useEffect, useState } from "react";
import { useInfiniteHits, useInstantSearch } from "react-instantsearch-hooks-web";
import { visitDiscriminatedUnion } from "../utils/visitDiscriminatedUnion";
import { SearchHit } from "./SearchHit";
import type { SearchRecord } from "./types";

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
            <div
                className={classNames("text-text-default flex w-full flex-col items-center", {
                    "py-3": progress !== "nil" && hits.length === 0,
                    "min-h-[6rem]": progress !== "nil",
                })}
            >
                {visitDiscriminatedUnion({ progress }, "progress")._visit<React.ReactNode>({
                    nil: () => null,
                    pending: () => null,
                    error: () => "An unexpected error has occurred while loading the results.",
                    success: () => (results.length > 0 ? results : "No results"),
                    _other: () => null,
                })}
            </div>
        </div>
    );
};
