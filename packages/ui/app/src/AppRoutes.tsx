import { RoutesWith404 } from "@fern-api/routing-utils";
import { Route } from "react-router-dom";
import { ApiPage } from "./api-page/ApiPage";
import { DefinitionRoutes } from "./api-page/routes";
import { ApisPage } from "./apis-page/ApisPage";
import { useCurrentUser } from "./auth/useCurrentUser";
import { LoginPage } from "./login-page/LoginPage";
import { OrganizationsPage } from "./organizations-page/OrganizationsPage";
import { FernRoutes } from "./routes";
import { useAreFernFontsReady } from "./useAreFernFontsReady";

export const AppRoutes: React.FC = () => {
    const areFontsReady = useAreFernFontsReady();
    const currentUser = useCurrentUser();

    if (!areFontsReady || currentUser.type !== "loaded") {
        return null;
    }

    return (
        <RoutesWith404>
            <Route
                path={FernRoutes.HOME.absolutePath}
                element={currentUser.value == null ? <LoginPage /> : <OrganizationsPage />}
            />
            <Route path={FernRoutes.ORGANIZATION.absolutePath} element={<ApisPage />} />
            <Route path={`${DefinitionRoutes.API_DEFINITION.absolutePath}/*`} element={<ApiPage />} />
        </RoutesWith404>
    );
};
