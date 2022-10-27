import { Button } from "@blueprintjs/core";
import { Pane, ResizeHandlePosition, SplitView } from "@fern-ui/split-view";
import React from "react";
import { ResourceView } from "./ResourceView";
import { Sidebar } from "./Sidebar";

export const EditPage: React.FC = () => {
    return (
        <SplitView orientation="horizontal">
            <Pane
                defaultSize="350px"
                minimumSize="200px"
                sizeToCollapse="75px"
                maximumSize="50%"
                resizeHandlePosition={ResizeHandlePosition.RIGHT}
            >
                {({ isCollapsed, toggleIsCollapsed }) =>
                    isCollapsed ? <Button onClick={toggleIsCollapsed} /> : <Sidebar />
                }
            </Pane>
            <ResourceView />
        </SplitView>
    );
};
