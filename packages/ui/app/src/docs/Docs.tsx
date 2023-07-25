import { PLATFORM } from "@fern-api/core-utils";
import { useKeyboardCommand } from "@fern-api/react-commons";
import { useDocsContext } from "../docs-context/useDocsContext";
import { MobileSidebar } from "../mobile-sidebar/MobileSidebar";
import { useSearchContext } from "../search-context/useSearchContext";
import { SearchDialog } from "../search/SearchDialog";
import { useSearchService } from "../services/useSearchService";
import { Sidebar } from "../sidebar/Sidebar";
import { DocsMainContent } from "./DocsMainContent";
import { Header } from "./Header";
import nebulaImage from "./nebula.png";
import { useCustomTheme } from "./useCustomTheme";

export const Docs: React.FC = () => {
    const { docsDefinition } = useDocsContext();
    const { isSearchDialogOpen, openSearchDialog, closeSearchDialog } = useSearchContext();
    const searchService = useSearchService();
    useCustomTheme(docsDefinition);
    useKeyboardCommand({ key: "K", platform: PLATFORM, onCommand: openSearchDialog });

    return (
        <div
            className="relative flex min-h-0 flex-1 flex-col bg-cover"
            style={{ backgroundImage: `url('${nebulaImage.src}')` }}
        >
            {searchService.isAvailable && <SearchDialog isOpen={isSearchDialogOpen} onClose={closeSearchDialog} />}
            <div className="border-border bg-background sticky inset-x-0 top-0 z-20 border-b">
                <Header />
                <div className="flex md:hidden">
                    <MobileSidebar />
                </div>
            </div>
            <div className="flex min-h-0 flex-1">
                <div className="hidden w-64 md:flex">
                    <Sidebar />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                    <DocsMainContent />
                </div>
            </div>
        </div>
    );
};
