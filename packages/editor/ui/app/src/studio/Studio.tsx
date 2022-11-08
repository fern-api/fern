import { NonIdealState, Spinner } from "@blueprintjs/core";
import { delay } from "@fern-api/core-utils";
import { isLoaded, Loadable, loaded, loading, notStartedLoading } from "@fern-api/loadable";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { Pane, ResizeHandlePosition, SplitView } from "@fern-ui/split-view";
import React, { useEffect, useState } from "react";
import { ApiEditorContextProvider } from "../api-editor-context/ApiEditorContextProvider";
import { SidebarContextProvider } from "./sidebar/context/SidebarContextProvider";
import { Sidebar } from "./sidebar/Sidebar";
import { StudioPage } from "./StudioPage";

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
                    <StudioPage />
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
                    rootPackages: ["9a570317-61fe-4d04-baeb-2a20f2579f12"],
                    packages: {
                        "9a570317-61fe-4d04-baeb-2a20f2579f12": {
                            packageId: "9a570317-61fe-4d04-baeb-2a20f2579f12",
                            packageName: "my package",
                            packages: [],
                            endpoints: [],
                            types: ["43ea24dd-591f-4a1f-aad4-0c7f2795eca4", "3f4e1908-52e9-45fd-a9ce-eac9472bee6e"],
                            errors: [],
                        },
                    },
                    endpoints: {},
                    types: {
                        "43ea24dd-591f-4a1f-aad4-0c7f2795eca4": {
                            typeId: "43ea24dd-591f-4a1f-aad4-0c7f2795eca4",
                            typeName: "My type",
                            shape: FernApiEditor.Shape.alias({}),
                            description: "My description",
                        },
                        "3f4e1908-52e9-45fd-a9ce-eac9472bee6e": {
                            typeId: "3f4e1908-52e9-45fd-a9ce-eac9472bee6e",
                            typeName: "",
                            shape: FernApiEditor.Shape.alias({}),
                        },
                    },
                    errors: {},
                })
            );
        }

        void loadApi();
    }, []);

    return api;
}
