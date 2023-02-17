import { RoutesWith404 } from "@fern-api/routing-utils";
import { FernRegistry } from "@fern-fern/registry";
import { Route } from "react-router-dom";
import { RELATIVE_ENDPOINT, RELATIVE_TYPE } from "../../routes/routes";
import { Endpoint } from "./endpoints/Endpoint";
import { SubpackageRoutes } from "./SubpackageRoutes";

const SUBPACKAGE_NAME_PARAM = "SUBPACKAGE_NAME";

export declare namespace PackageRoutes {
    export interface Props {
        api: FernRegistry.ApiDefinition;
        parent: FernRegistry.ApiDefinitionPackage;
    }
}

export const PackageRoutes: React.FC<PackageRoutes.Props> = ({ api, parent }) => {
    return (
        <RoutesWith404>
            <Route path={RELATIVE_ENDPOINT.absolutePath} element={<Endpoint package={parent} />} />
            <Route path={RELATIVE_TYPE.absolutePath} element={<div>type</div>} />
            <Route path={`:${SUBPACKAGE_NAME_PARAM}/*`} element={<SubpackageRoutes api={api} parent={parent} />} />
            <Route path="" element={<div>package page</div>} />
        </RoutesWith404>
    );
};
