import classNames from "classnames";
import { useDocsContext } from "../docs-context/useDocsContext";
import { Sidebar } from "../sidebar/Sidebar";
import { DocsMainContent } from "./DocsMainContent";
import { Header } from "./Header";
import { useCustomTheme } from "./useCustomTheme";

export const LoadedDocs: React.FC = () => {
    const { docsDefinition } = useDocsContext();
    useCustomTheme(docsDefinition);

    return (
        <div className={classNames("flex flex-col flex-1 min-h-0", "dark:bg-[#19181C]")}>
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
