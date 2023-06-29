import { Highlight } from "react-instantsearch-hooks-web";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useSearchContext } from "../search-context/useSearchContext";

export declare namespace SearchHit {
    export interface Props {
        // TODO: Needs to be imported from our sdk
        hit: {
            __position: number;
            objectID: string;
            title: string;
            subtitle: string;
            path: string;
        };
    }
}

export const SearchHit: React.FC<SearchHit.Props> = (providedProps) => {
    const { navigateToPath } = useDocsContext();
    const { closeSearchDialog } = useSearchContext();
    const { hit } = providedProps;

    return (
        <button
            className="hover:bg-accentPrimary group flex w-full flex-col space-y-1 rounded-md p-2"
            onClick={() => {
                closeSearchDialog();
                navigateToPath(hit.path);
            }}
        >
            <div className="flex flex-col items-start">
                <Highlight
                    className="text-text-default text-start group-hover:text-white"
                    attribute="title"
                    hit={hit}
                />
            </div>
            <div className="flex flex-col items-start">
                <Highlight
                    className="text-text-default text-start group-hover:text-white"
                    attribute="subtitle"
                    hit={hit}
                />
            </div>
        </button>
    );
};
