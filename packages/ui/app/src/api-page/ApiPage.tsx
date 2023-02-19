import { Pane, ResizeHandlePosition, SplitView } from "@fern-api/split-view";
import { generatePath, useParams } from "react-router-dom";
import { FernRoutes } from "../routes";
import { ApiDefinitionContextProvider } from "./api-context/ApiDefinitionContextProvider";
import { ApiTabs } from "./api-tabs/ApiTabs";
import { ApiTabsContextProvider } from "./api-tabs/context/ApiTabsContextProvider";
import styles from "./ApiPage.module.scss";
import { Header } from "./Header";
import { DefinitionSidebar } from "./sidebar/definition-sidebar/DefinitionSidebar";

export const ApiPage: React.FC = () => {
    const {
        [FernRoutes.API_DEFINITION.parameters.API_ID]: apiIdParam,
        [FernRoutes.API_DEFINITION.parameters.ENVIRONMENT_ID]: environmentIdParam,
    } = useParams();

    if (apiIdParam == null) {
        throw new Error("API ID is not defined");
    }
    if (environmentIdParam == null) {
        throw new Error("Environment ID is not defined");
    }

    return (
        <ApiDefinitionContextProvider>
            <ApiTabsContextProvider
                basePath={generatePath(FernRoutes.API_DEFINITION.absolutePath, {
                    API_ID: apiIdParam,
                    ENVIRONMENT_ID: environmentIdParam,
                })}
            >
                <div className={styles.container}>
                    <Header />
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
            </ApiTabsContextProvider>
        </ApiDefinitionContextProvider>
    );
};
