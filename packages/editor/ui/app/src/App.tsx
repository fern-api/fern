import { FocusStyleManager, HotkeysProvider } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import { RoutesWith404 } from "@fern-api/routing-utils";
import { SplitViewProvider } from "@fern-api/split-view";
import { ThemeProvider } from "@fern-api/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "normalize.css";
import { BrowserRouter, Route } from "react-router-dom";
import styles from "./App.module.scss";
import { StudioRoutes } from "./studio/routes";
import { Studio } from "./studio/Studio";

FocusStyleManager.onlyShowFocusOnTabs();

const queryClient = new QueryClient();

export const App: React.FC = () => {
    return (
        <div className={styles.app}>
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <ThemeProvider>
                        <HotkeysProvider>
                            <SplitViewProvider>
                                <RoutesWith404>
                                    <Route path={`${StudioRoutes.STUDIO.absolutePath}/*`} element={<Studio />} />
                                </RoutesWith404>
                            </SplitViewProvider>
                        </HotkeysProvider>
                    </ThemeProvider>
                </QueryClientProvider>
            </BrowserRouter>
        </div>
    );
};
