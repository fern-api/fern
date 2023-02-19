import { Pane, ResizeHandlePosition, SplitView } from "@fern-api/split-view";
import { generatePath } from "react-router-dom";
import { FernRoutes } from "../routes";
import { useCurrentApiIdOrThrow } from "../routes/getCurrentApiId";
import { ApiTabs } from "./api-tabs/ApiTabs";
import { ApiTabsContextProvider } from "./api-tabs/context/ApiTabsContextProvider";
import styles from "./ApiPage.module.scss";
import { Header } from "./Header";
import { DefinitionSidebar } from "./sidebar/definition-sidebar/DefinitionSidebar";

export const ApiPage: React.FC = () => {
    const apiId = useCurrentApiIdOrThrow();

    return (
        <ApiTabsContextProvider
            basePath={generatePath(FernRoutes.API_DEFINITION.absolutePath, {
                API_ID: apiId,
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
    );
};
