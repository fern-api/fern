import classNames from "classnames";
import { useDocsContext } from "../docs-context/useDocsContext";
import { Sidebar } from "../sidebar/Sidebar";
import { DocsMainContent } from "./DocsMainContent";
import { Header } from "./Header";
import { PageNavigationButton } from "./PageNavigationButton";

export const LoadedDocs: React.FC = () => {
    const { nextPath, previousPath } = useDocsContext();

    return (
        <div className={classNames("flex flex-1 min-h-0", "dark:bg-[#19181C]")}>
            <div className="flex w-64">
                <Sidebar />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
                <Header />
                <DocsMainContent />
                <div className="flex justify-between">
                    {previousPath ? <PageNavigationButton path={previousPath} text="Previous" /> : <div />}
                    {nextPath ? <PageNavigationButton path={nextPath} text="Next" /> : <div />}
                </div>
            </div>
        </div>
    );
};
