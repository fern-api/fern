import { RoutesWith404 } from "@fern-api/routing-utils";
import { Route } from "react-router-dom";
import { DocsPage } from "./docs-page/DocsPage";
import { FernRoutes } from "./routes";
import { useAreFernFontsReady } from "./useAreFernFontsReady";

export const AppRoutes: React.FC = () => {
    const areFontsReady = useAreFernFontsReady();

    if (!areFontsReady) {
        return null;
    }

    return (
        <RoutesWith404>
            <Route path={FernRoutes.HOME.absolutePath} element={<DocsPage />} />
        </RoutesWith404>
    );
};
