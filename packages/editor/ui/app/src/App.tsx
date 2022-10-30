import { FocusStyleManager, HotkeysProvider } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import { SplitViewProvider } from "@fern-ui/split-view";
import { ThemeProvider } from "@fern-ui/theme";
import "normalize.css";
import { QueryClient, QueryClientProvider } from "react-query";
import styles from "./App.module.scss";
import { Studio } from "./studio/Studio";

FocusStyleManager.onlyShowFocusOnTabs();

const queryClient = new QueryClient();

export const App: React.FC = () => {
    return (
        <div className={styles.app}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider defaultIsDarkTheme>
                    <HotkeysProvider>
                        <SplitViewProvider>
                            <Studio />
                        </SplitViewProvider>
                    </HotkeysProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </div>
    );
};
