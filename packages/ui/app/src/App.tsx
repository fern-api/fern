import { FocusStyleManager } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import { RoutesWith404 } from "@fern-api/routing-utils";
import "normalize.css";
import { Route } from "react-router-dom";
import { ApiPage } from "./api-page/ApiPage";
import { DefinitionRoutes } from "./api-page/routes";
import { ApisPage } from "./apis-page/ApisPage";
import styles from "./App.module.scss";
import { CONTEXTS } from "./contexts";
import { FernRoutes } from "./routes";
import { useAreFernFontsReady } from "./useAreFernFontsReady";

FocusStyleManager.onlyShowFocusOnTabs();

export const App: React.FC = () => {
    const areFontsReady = useAreFernFontsReady();
    if (!areFontsReady) {
        return null;
    }
    return (
        <div className={styles.app}>
            {CONTEXTS.reduceRight(
                (children, Context) => (
                    <Context>{children}</Context>
                ),
                <RoutesWith404>
                    <Route path={FernRoutes.HOME.absolutePath} element={<ApisPage />} />
                    <Route path={FernRoutes.ORGANIZATION.absolutePath} element={<ApisPage />} />
                    <Route path={`${DefinitionRoutes.API_DEFINITION.absolutePath}/*`} element={<ApiPage />} />
                </RoutesWith404>
            )}
        </div>
    );
};
