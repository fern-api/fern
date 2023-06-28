import classNames from "classnames";
import { SearchDialog } from "../commons/SearchDialog";
import { useDocsContext } from "../docs-context/useDocsContext";
import { MobileSidebar } from "../mobile-sidebar/MobileSidebar";
import { Sidebar } from "../sidebar/Sidebar";
import { DocsMainContent } from "./DocsMainContent";
import { Header } from "./Header";
import nebulaImage from "./nebula.png";
import { useCustomTheme } from "./useCustomTheme";

export const Docs: React.FC = () => {
    const { docsDefinition, isSearchDialogOpen, closeSearchDialog } = useDocsContext();
    useCustomTheme(docsDefinition);

    return (
        <div
            className="relative flex min-h-0 flex-1 flex-col bg-cover"
            style={{ backgroundImage: `url('${nebulaImage.src}')` }}
        >
            <SearchDialog isOpen={isSearchDialogOpen} onClose={closeSearchDialog} />
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
