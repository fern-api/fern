import { Icon } from "@blueprintjs/core";
import { Highlight } from "react-instantsearch-hooks-web";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useSearchContext } from "../search-context/useSearchContext";
import { visitDiscriminatedUnion } from "../utils/visitDiscriminatedUnion";
import type { SearchRecord } from "./types";

export declare namespace SearchHit {
    export interface Props {
        hit: SearchRecord;
    }
}

export const SearchHit: React.FC<SearchHit.Props> = (providedProps) => {
    const { navigateToPath } = useDocsContext();
    const { closeSearchDialog } = useSearchContext();
    const { hit } = providedProps;

    return (
        <button
            className="hover:bg-accentPrimary group flex w-full items-center space-x-3 space-y-1 rounded-md p-2"
            onClick={() => {
                closeSearchDialog();
                navigateToPath(hit.path);
            }}
        >
            <Icon
                className="text-text-default group-hover:text-white"
                size={18}
                icon={visitDiscriminatedUnion(hit, "type")._visit({
                    endpoint: () => "code",
                    page: () => "document",
                    _other: () => "document",
                })}
            />

            <div className="flex w-full flex-col space-y-1.5">
                <div className="flex justify-between">
                    <Highlight
                        className="text-text-default line-clamp-1 text-start group-hover:text-white"
                        attribute="title"
                        hit={hit}
                    />
                    <div className="text-text-default text-xs uppercase tracking-widest group-hover:text-white">
                        {visitDiscriminatedUnion(hit, "type")._visit({
                            page: () => "Page",
                            endpoint: () => "Endpoint",
                            _other: () => null,
                        })}
                    </div>
                </div>
                <div className="flex flex-col items-start">
                    <Highlight
                        className="text-text-default line-clamp-1 text-start group-hover:text-white"
                        attribute="subtitle"
                        hit={hit}
                    />
                </div>
            </div>
        </button>
    );
};
