import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { Header } from "../header/Header";
import { useApiMetadata } from "../queries/useApiMetadata";
import { ApiPageExamples } from "./ApiPageExamples";
import { ApiPageMainContent } from "./ApiPageMainContent";
import { useCurrentApiIdOrThrow } from "./routes/useCurrentApiId";
import { DefinitionSidebar } from "./sidebar/definition-sidebar/DefinitionSidebar";

export const ApiPageContents: React.FC = () => {
    const apiId = useCurrentApiIdOrThrow();
    const apiMetadata = useApiMetadata(apiId);

    return (
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
            <Header
                centerContent={
                    <div
                        className={classNames({
                            [Classes.SKELETON]: apiMetadata.type !== "loaded",
                        })}
                    >
                        {apiMetadata.type === "loaded" ? apiMetadata.value.name : "SKELETON_TEXT"}
                    </div>
                }
            />
            <div className="flex flex-1 min-h-0">
                <div className="flex w-72">
                    <DefinitionSidebar />
                </div>
                <div className="flex flex-col flex-1 min-w-0 mr-10">
                    <ApiPageMainContent />
                </div>
                <div className="flex w-1/3 min-w-[500px]">
                    <ApiPageExamples />
                </div>
            </div>
        </div>
    );
};
