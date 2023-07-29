import { Icon } from "@blueprintjs/core";
import { Dialog } from "@headlessui/react";
import classNames from "classnames";
import { InstantSearch, SearchBox } from "react-instantsearch-hooks-web";
import { useSearchService } from "../services/useSearchService";
import styles from "./SearchDialog.module.scss";
import { SearchHits } from "./SearchHits";

export declare namespace SearchDialog {
    export interface Props {
        isOpen: boolean;
        onClose: () => void;
    }
}

export const SearchDialog: React.FC<SearchDialog.Props> = (providedProps) => {
    const { isOpen, onClose } = providedProps;
    const searchService = useSearchService();

    if (!searchService.isAvailable) {
        return null;
    }

    return (
        <Dialog as="div" className="fixed inset-0 z-30" open={isOpen} onClose={onClose}>
            <InstantSearch searchClient={searchService.client} indexName={searchService.index}>
                <div className="flex min-h-screen items-start justify-center p-4">
                    <Dialog.Overlay className="fixed inset-0 bg-slate-600/40 backdrop-blur-sm" />
                    <div className="z-10 mx-3 mb-8 mt-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-md bg-neutral-950 text-left align-middle shadow-2xl">
                        <div className={classNames(styles.searchBox, "flex items-center space-x-3 px-5")}>
                            <Icon className="text-text-default" icon="search" size={14} />
                            <SearchBox
                                inputMode="text"
                                autoFocus
                                placeholder="Find something..."
                                classNames={{
                                    root: "w-full",
                                    loadingIcon: "hidden",
                                    loadingIndicator: "hidden",
                                    reset: "hidden",
                                    resetIcon: "hidden",
                                    submit: "hidden",
                                    submitIcon: "hidden",
                                    input: "w-full text-base text-text-default placeholder:text-text-default bg-transparent py-5",
                                }}
                            />
                        </div>
                        <SearchHits />
                    </div>
                </div>
            </InstantSearch>
        </Dialog>
    );
};
