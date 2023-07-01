import classNames from "classnames";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useKeyboardCommand } from "../hooks/useKeyboardCommand";
import { MobileSidebar } from "../mobile-sidebar/MobileSidebar";
import { useSearchContext } from "../search-context/useSearchContext";
import { SearchDialog } from "../search/SearchDialog";
import { Sidebar } from "../sidebar/Sidebar";
import { DocsMainContent } from "./DocsMainContent";
import { Header } from "./Header";
import nebulaImage from "./nebula.png";
import { useCustomTheme } from "./useCustomTheme";

export const Docs: React.FC = () => {
    const { docsDefinition } = useDocsContext();
    const { isSearchDialogOpen, openSearchDialog, closeSearchDialog } = useSearchContext();
    useCustomTheme(docsDefinition);
    useKeyboardCommand("K", openSearchDialog);

    const { algoliaSearchIndex } = docsDefinition;
    const isSearchAvailable = !!algoliaSearchIndex;

    return (
        <div
            className="relative flex min-h-0 flex-1 flex-col bg-cover"
            style={{ backgroundImage: `url('${nebulaImage.src}')` }}
        >
            {isSearchAvailable && (
                <SearchDialog
                    isOpen={isSearchDialogOpen}
                    onClose={closeSearchDialog}
                    searchIndexName={algoliaSearchIndex}
                />
            )}
            <div className="border-border bg-background sticky inset-x-0 top-0 border-b">
                <Header />
                <div className="flex md:hidden">
                    <MobileSidebar />
                </div>
            </div>
            <div className="flex min-h-0 flex-1">
                <div className={classNames("w-64", "hidden md:flex")}>
                    <Sidebar />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                    <DocsMainContent />
                </div>
            </div>
        </div>
    );
};
