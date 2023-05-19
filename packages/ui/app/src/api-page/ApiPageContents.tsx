import classNames from "classnames";
import { Sidebar } from "../sidebar/definition-sidebar/Sidebar";
import { ApiPageMainContent } from "./ApiPageMainContent";

export const ApiPageContents: React.FC = () => {
    return (
        <div className={classNames("flex flex-1 min-h-0", "dark:bg-[#19181C]")}>
            <div className="flex w-72">
                <Sidebar />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
                <ApiPageMainContent />
            </div>
        </div>
    );
};
