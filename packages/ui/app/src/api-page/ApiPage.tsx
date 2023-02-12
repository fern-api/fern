import { Pane, ResizeHandlePosition, SplitView } from "@fern-api/split-view";
import styles from "./ApiPage.module.scss";
import { ApiContextProvider } from "./context/ApiContextProvider";
import { ApiDefinition } from "./definition/ApiDefinition";
import { Header } from "./Header";
import { ApiSidebar } from "./sidebar/ApiSidebar";

export const ApiPage: React.FC = () => {
    return (
        <ApiContextProvider>
            <div className={styles.container}>
                <Header />
                <SplitView orientation="horizontal">
                    <Pane
                        defaultSize="275px"
                        minimumSize="200px"
                        maximumSize="50%"
                        resizeHandlePosition={ResizeHandlePosition.RIGHT}
                    >
                        <ApiSidebar />
                    </Pane>
                    <ApiDefinition />
                </SplitView>
            </div>
        </ApiContextProvider>
    );
};
