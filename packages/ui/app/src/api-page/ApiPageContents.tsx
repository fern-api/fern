import { Button } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Pane, ResizeHandlePosition, SplitView } from "@fern-api/split-view";
import { Header } from "../header/Header";
import { ApiTabs } from "./api-tabs/ApiTabs";
import { DefinitionSidebar } from "./sidebar/definition-sidebar/DefinitionSidebar";

export const ApiPageContents: React.FC = () => {
    return (
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
            <Header
                centerContent={
                    <div className="flex text-lg gap-1">
                        <div>Authentication Service</div>
                        <Button minimal icon={IconNames.CHEVRON_DOWN} />
                    </div>
                }
            />
            <SplitView orientation="horizontal">
                <Pane
                    defaultSize="275px"
                    minimumSize="200px"
                    maximumSize="50%"
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
