import { Pane, ResizeHandlePosition, SplitView } from "@fern-api/split-view";
import { ApiDefinitionContextProvider } from "./api-context/ApiDefinitionContextProvider";
import { ApiTabs } from "./api-tabs/ApiTabs";
import { ApiTabsContextProvider } from "./api-tabs/context/ApiTabsContextProvider";
import styles from "./ApiPage.module.scss";
import { Header } from "./Header";
import { DefinitionSidebar } from "./sidebar/definition-sidebar/DefinitionSidebar";

export const ApiPage: React.FC = () => {
    return (
        <ApiDefinitionContextProvider>
            <ApiTabsContextProvider>
                <div className={styles.container}>
                    <Header />
                    <SplitView orientation="horizontal">
                        <Pane
                            defaultSize="275px"
                            minimumSize="200px"
                            maximumSize="50%"
                            resizeHandlePosition={ResizeHandlePosition.RIGHT}
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
