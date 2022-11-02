import { NonIdealState, Spinner } from "@blueprintjs/core";
import { delay } from "@fern-api/core-utils";
import { isLoaded, Loadable, loaded, loading, notStartedLoading } from "@fern-api/loadable";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { Pane, ResizeHandlePosition, SplitView } from "@fern-ui/split-view";
import React, { useEffect, useState } from "react";
import { ApiEditorContextProvider } from "../api-editor-context/ApiEditorContextProvider";
import { ResourceView } from "../ResourceView";
import { SidebarContextProvider } from "./sidebar/context/SidebarContextProvider";
import { Sidebar } from "./sidebar/Sidebar";

export const Studio: React.FC = () => {
    const initialApi = useInitialApi();

    // TODO if we cascade the loading state it's easier to show skeletons,
    // but more annoying to constantly have not-yet-loaded wrappers of each component
    if (!isLoaded(initialApi)) {
        return <NonIdealState title={<Spinner />} />;
    }

    return (
        <ApiEditorContextProvider initialApi={initialApi.value}>
            <SidebarContextProvider>
                <SplitView orientation="horizontal">
                    <Pane
                        defaultSize="350px"
                        minimumSize="200px"
                        maximumSize="50%"
                        resizeHandlePosition={ResizeHandlePosition.RIGHT}
                    >
                        <Sidebar />
                    </Pane>
                    <ResourceView />
                </SplitView>
            </SidebarContextProvider>
        </ApiEditorContextProvider>
    );
};

// TODO replace with backend call
function useInitialApi(): Loadable<FernApiEditor.Api> {
    const [api, setApi] = useState<Loadable<FernApiEditor.Api>>(notStartedLoading());

    useEffect(() => {
        async function loadApi() {
            setApi(loading());
            await delay(350 + 350 * Math.random());
            setApi(
                loaded({
                    apiId: "my-api-id",
                    apiName: "My API",
                    rootPackages: [],
                    packages: {},
                    endpoints: {},
                    types: {},
                    errors: {},
                })
            );
        }

        void loadApi();
    }, []);

    return api;
}
