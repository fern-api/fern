import { Icon } from "@blueprintjs/core";
import { Dialog } from "@headlessui/react";
import algolia from "algoliasearch/lite";
import { Configure, Hits, InstantSearch, Pagination, SearchBox } from "react-instantsearch-hooks-web";
import { SearchHit } from "./SearchHit";

if (
    !process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ||
    !process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ||
    !process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_INDEX
) {
    // TODO: Move this validation elsewhere
    throw new Error("Missing Algolia variables.");
}

const searchClient = algolia(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, process.env.NEXT_PUBLIC_ALGOLIA_API_KEY);
const searchIndexName = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_INDEX;

export declare namespace SearchDialog {
    export interface Props {
        isOpen: boolean;
        onClose: () => void;
    }
}

export const SearchDialog: React.FC<SearchDialog.Props> = (providedProps) => {
    const { isOpen, onClose } = providedProps;

    return (
        <Dialog as="div" className="fixed inset-0 z-10" open={isOpen} onClose={onClose}>
            <InstantSearch searchClient={searchClient} indexName={searchIndexName}>
                <div className="flex min-h-screen items-start justify-center p-4">
                    <Dialog.Overlay className="fixed inset-0 bg-gray-800/75" />
                    <div className="border-border mx-3 mb-8 mt-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-md border bg-gray-900 text-left align-middle shadow-2xl backdrop-blur-xl">
                        <div className="border-border flex items-center space-x-3 border-b px-3">
                            <Icon className="text-text-muted" icon="search" size={14} />
                            <SearchBox
                                inputMode="text"
                                placeholder="Find something..."
                                classNames={{
                                    root: "w-full",
                                    loadingIcon: "hidden",
                                    loadingIndicator: "hidden",
                                    reset: "hidden",
                                    resetIcon: "hidden",
                                    submit: "hidden",
                                    submitIcon: "hidden",
                                    input: "w-full text-text-default placeholder:text-text-muted bg-transparent py-5",
                                }}
                            />
                        </div>
                        <Hits hitComponent={SearchHit} className="p-2" />
                    </div>
                </div>

                {/* Algolia has incorrectly typed the props for this component so we need to ignore the TS error for now. */}
                {/* eslint-disable-next-line */}
                {/* @ts-ignore */}
                <Configure hitsPerPage={6} />

                <Pagination />
            </InstantSearch>
        </Dialog>
    );
};
