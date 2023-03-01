import { FocusStyleManager, HotkeysProvider } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import { RoutesWith404 } from "@fern-api/routing-utils";
import { SplitViewProvider } from "@fern-api/split-view";
import "normalize.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter, Route } from "react-router-dom";
import { ApiPage } from "./api-page/ApiPage";
import { DefinitionRoutes } from "./api-page/routes";
import { ApisPage } from "./apis-page/ApisPage";
import styles from "./App.module.scss";
import { Auth0ProviderWithHistory } from "./auth/Auth0ProviderWithHistory";
import { FernRoutes } from "./routes";
import { useAreFernFontsReady } from "./useAreFernFontsReady";

FocusStyleManager.onlyShowFocusOnTabs();

const queryClient = new QueryClient();

// these are client-side safe
const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN ?? "fern-prod.us.auth0.com";
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID ?? "rTDcpFMWvsv9U36EZ81TsDPofuPCylCg";

export const App: React.FC = () => {
    const areFontsReady = useAreFernFontsReady();
    if (!areFontsReady) {
        return null;
    }
    return (
        <div className={styles.app}>
            <BrowserRouter>
                <Auth0ProviderWithHistory domain={AUTH0_DOMAIN} clientId={AUTH0_CLIENT_ID} loginPath="/" logoutPath="/">
                    <QueryClientProvider client={queryClient}>
                        <HotkeysProvider>
                            <SplitViewProvider>
                                <RoutesWith404>
                                    <Route path={FernRoutes.HOME.absolutePath} element={<ApisPage />} />
                                    <Route
                                        path={`${DefinitionRoutes.API_DEFINITION.absolutePath}/*`}
                                        element={<ApiPage />}
                                    />
                                </RoutesWith404>
                            </SplitViewProvider>
                        </HotkeysProvider>
                    </QueryClientProvider>
                </Auth0ProviderWithHistory>
            </BrowserRouter>
        </div>
    );
};
