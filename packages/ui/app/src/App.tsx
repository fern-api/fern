import { FocusStyleManager, HotkeysProvider } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import { Redirect, RoutesWith404 } from "@fern-api/routing-utils";
import { SplitViewProvider } from "@fern-api/split-view";
import "normalize.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter, Route } from "react-router-dom";
import { ApiPage } from "./api-page/ApiPage";
import styles from "./App.module.scss";
import { Routes } from "./routes";
import { useAreFernFontsReady } from "./useAreFernFontsReady";

FocusStyleManager.onlyShowFocusOnTabs();

const queryClient = new QueryClient();

export const App: React.FC = () => {
    const areFontsReady = useAreFernFontsReady();
    if (!areFontsReady) {
        return null;
    }
    return (
        <div className={styles.app}>
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <HotkeysProvider>
                        <SplitViewProvider>
                            <RoutesWith404>
                                <Route path={Routes.HOME.absolutePath} element={<div>home</div>} />
                                <Route
                                    path={Routes.API.absolutePath}
                                    element={<Redirect to="/api1/definition/production" />}
                                />
                                <Route path={Routes.API_DEFINITION.absolutePath} element={<ApiPage />} />
                            </RoutesWith404>
                        </SplitViewProvider>
                    </HotkeysProvider>
                </QueryClientProvider>
            </BrowserRouter>
        </div>
    );
};
