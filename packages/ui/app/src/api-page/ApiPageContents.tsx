import { Classes } from "@blueprintjs/core";
import { Pane, ResizeHandlePosition, SplitView } from "@fern-api/split-view";
import classNames from "classnames";
import { Header } from "../header/Header";
import { useApiMetadata } from "../queries/useApiMetadata";
import { ApiTabs } from "./api-tabs/ApiTabs";
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
            <SplitView orientation="horizontal">
                <Pane
                    defaultSize="275px"
                    minimumSize="200px"
                    maximumSize="30%"
                    resizeHandlePosition={ResizeHandlePosition.RIGHT}
                    resizeHandleLineColor="lightgray"
                >
                    <DefinitionSidebar />
                </Pane>
                <ApiTabs />
            </SplitView>
        </div>
    );
};
