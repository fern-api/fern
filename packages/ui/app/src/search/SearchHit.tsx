import { Icon } from "@blueprintjs/core";
import { visitDiscriminatedUnion } from "@fern-api/core-utils";
import Link from "next/link";
import { Snippet } from "react-instantsearch-hooks-web";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useSearchContext } from "../search-context/useSearchContext";
import type { SearchRecord } from "./types";

export declare namespace SearchHit {
    export interface Props {
        hit: SearchRecord;
    }
}

export const SearchHit: React.FC<SearchHit.Props> = ({ hit }) => {
    const { navigateToPath } = useDocsContext();
    const { closeSearchDialog } = useSearchContext();

    return (
        <Link
            className="hover:bg-accentHighlight group flex w-full items-center space-x-3 space-y-1 rounded-md p-2 hover:no-underline"
            onClick={() => {
                closeSearchDialog();
                navigateToPath(hit.path);
            }}
            href={`/${hit.path}`}
        >
            <Icon
                className="!text-text-default group-hover:!text-text-stark"
                size={18}
                icon={visitDiscriminatedUnion(hit, "type")._visit({
                    endpoint: () => "code",
                    page: () => "document",
                    _other: () => "document",
                })}
            />

            <div className="flex w-full flex-col space-y-1.5">
                <div className="flex justify-between">
                    <Snippet
                        className="text-text-stark group-hover:text-text-stark line-clamp-1 text-start"
                        attribute="title"
                        highlightedTagName="span"
                        hit={hit}
                    />
                    <div className="text-text-default group-hover:text-text-stark text-xs uppercase tracking-widest">
                        {visitDiscriminatedUnion(hit, "type")._visit({
                            page: () => "Page",
                            endpoint: () => "Endpoint",
                            _other: () => null,
                        })}
                    </div>
                </div>
                <div className="flex flex-col items-start">
                    <Snippet
                        className="text-text-default group-hover:text-text-stark line-clamp-1 text-start"
                        attribute="subtitle"
                        highlightedTagName="span"
                        hit={hit}
                    />
                </div>
            </div>
        </Link>
    );
};
