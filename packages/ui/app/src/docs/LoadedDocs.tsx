import { useEffect } from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
import { Sidebar } from "../sidebar/Sidebar";
import { DocsMainContent } from "./DocsMainContent";
import { Header } from "./Header";
import nebulaImage from "./nebula.png";
import { useCustomTheme } from "./useCustomTheme";

export const LoadedDocs: React.FC = () => {
    const { docsDefinition, resolveFile } = useDocsContext();
    useCustomTheme(docsDefinition);

    useEffect(() => {
        document.title = docsDefinition.config.title ?? "Documentation";

        if (docsDefinition.config.favicon != null) {
            const faviconElement = document.getElementById("favicon");
            console.log(faviconElement);
            if (faviconElement != null) {
                (faviconElement as HTMLLinkElement).href = resolveFile(docsDefinition.config.favicon);
            }
        }
    }, [docsDefinition.config.favicon, docsDefinition.config.title, resolveFile]);

    return (
        <div
            className="relative flex min-h-0 flex-1 flex-col bg-cover"
            style={{ backgroundImage: `url('${nebulaImage}')` }}
        >
            <Header />
            <div className="flex min-h-0 flex-1">
                <div className="flex w-64">
                    <Sidebar />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                    <DocsMainContent />
                </div>
            </div>
        </div>
    );
};
