import classNames from "classnames";
import { Sidebar } from "../sidebar/Sidebar";
import { DocsMainContent } from "./DocsMainContent";
import { Header } from "./Header";

export const LoadedDocs: React.FC = () => {
    return (
        <div className={classNames("flex flex-1 min-h-0", "dark:bg-[#19181C]")}>
            <div className="flex w-64">
                <Sidebar />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
                <Header />
                <DocsMainContent />
            </div>
        </div>
    );
};
