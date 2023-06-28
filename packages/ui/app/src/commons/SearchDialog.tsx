import { Icon } from "@blueprintjs/core";
import { Dialog } from "@headlessui/react";

export declare namespace SearchDialog {
    export interface Props {
        isOpen: boolean;
        onClose: () => void;
    }
}

export const SearchDialog: React.FC<SearchDialog.Props> = (providedProps) => {
    const { isOpen, onClose } = providedProps;

    // TODO: Implement

    return (
        <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" open={isOpen} onClose={onClose}>
            <div className="flex min-h-screen items-start justify-center p-4">
                <Dialog.Overlay className="fixed inset-0 bg-gray-800/75" />
                <div className="border-border mx-3 mb-8 mt-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-md border bg-gray-900 text-left align-middle shadow-2xl backdrop-blur-xl">
                    <div className="border-border flex border-b px-2.5 py-3">
                        <Icon className="text-text-muted" icon="search" size={14} />
                        <div className="text-text-muted transition">Search</div>
                    </div>
                    <div className="px-2.5 py-2">Results</div>
                </div>
            </div>
        </Dialog>
    );
};
