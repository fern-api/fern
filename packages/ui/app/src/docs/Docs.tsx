import classNames from "classnames";
import { useDocsContext } from "../docs-context/useDocsContext";
import { MobileSidebar } from "../mobile-sidebar/MobileSidebar";
import { Sidebar } from "../sidebar/Sidebar";
import { DocsMainContent } from "./DocsMainContent";
import { Header } from "./Header";
import nebulaImage from "./nebula.png";
import { useCustomTheme } from "./useCustomTheme";

export const Docs: React.FC = () => {
    const { docsDefinition } = useDocsContext();
    useCustomTheme(docsDefinition);

    return (
        <div
            className="relative flex min-h-0 flex-1 flex-col bg-cover"
            style={{ backgroundImage: `url('${nebulaImage.src}')` }}
        >
            <div className="border-border z-1 bg-background sticky inset-x-0 top-0 z-10 border-b">
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
