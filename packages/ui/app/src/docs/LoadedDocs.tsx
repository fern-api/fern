import Head from "next/head";
import { useDocsContext } from "../docs-context/useDocsContext";
import { Sidebar } from "../sidebar/Sidebar";
import { DocsMainContent } from "./DocsMainContent";
import { Header } from "./Header";
import nebulaImage from "./nebula.png";
import { useCustomTheme } from "./useCustomTheme";

export const LoadedDocs: React.FC = () => {
    const { docsDefinition, resolveFile } = useDocsContext();
    useCustomTheme(docsDefinition);

    return (
        <div
            className="relative flex min-h-0 flex-1 flex-col bg-cover"
            style={{ backgroundImage: `url('${nebulaImage}')` }}
        >
            <Head>
                {docsDefinition.config.title != null && <title>{docsDefinition.config.title}</title>}
                {docsDefinition.config.favicon != null && (
                    <link rel="icon" id="favicon" href={resolveFile(docsDefinition.config.favicon)}></link>
                )}
            </Head>
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
