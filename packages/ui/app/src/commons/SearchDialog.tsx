import { Icon } from "@blueprintjs/core";
import { Dialog } from "@headlessui/react";
import { useState } from "react";

export declare namespace SearchDialog {
    export interface Props {
        isOpen: boolean;
        onClose: () => void;
    }
}

interface SearchResult {
    id: string;
    title: string;
    url: string;
}

export const SearchDialog: React.FC<SearchDialog.Props> = (providedProps) => {
    const { isOpen, onClose } = providedProps;
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);

    return (
        <Dialog
            as="div"
            className="fixed inset-0 z-10 overflow-y-auto"
            open={isOpen}
            onClose={() => {
                onClose();
                setQuery("");
            }}
        >
            <div className="flex min-h-screen items-start justify-center p-4">
                <Dialog.Overlay className="fixed inset-0 bg-gray-800/75" />
                <div className="border-border mx-3 mb-8 mt-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-md border bg-gray-900 text-left align-middle shadow-2xl backdrop-blur-xl">
                    <div className="border-border flex items-center space-x-3 border-b px-3">
                        <Icon className="text-text-muted" icon="search" size={14} />
                        <input
                            type="text"
                            className="text-text-default placeholder:text-text-muted flex-1 bg-transparent py-5"
                            placeholder="Find something..."
                            onChange={(e) => {
                                setQuery(e.currentTarget.value);
                            }}
                            value={query}
                        />
                    </div>
                    <div className="p-2">
                        {results.map((r) => (
                            <div key={r.id} className="h-8 flex-1 bg-red-800" />
                        ))}
                    </div>
                </div>
            </div>
        </Dialog>
    );
};
