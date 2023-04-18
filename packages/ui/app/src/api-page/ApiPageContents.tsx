import classNames from "classnames";
import { ApiPageMainContent } from "./ApiPageMainContent";
import { DefinitionSidebar } from "./sidebar/definition-sidebar/DefinitionSidebar";

export const ApiPageContents: React.FC = () => {
    return (
        <div className={classNames("flex flex-1 min-h-0", "dark:bg-[#19181C]")}>
            <div className="flex w-72">
                <DefinitionSidebar />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
                <ApiPageMainContent />
            </div>
        </div>
    );
};
