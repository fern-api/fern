import { RoutesWith404 } from "@fern-api/routing-utils";
import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { Route, useParams } from "react-router-dom";
import { Endpoint } from "./endpoints/Endpoint";

export declare namespace PackageRoutes {
    export interface Props {
        api: FernRegistry.ApiDefinition;
        parent: FernRegistry.ApiDefinitionPackage;
    }
}

export const PackageRoutes: React.FC<PackageRoutes.Props> = ({ api, parent }) => {
    const params = useParams();

    const package_ = useMemo(() => {
        if (params.subpackage != null) {
            return api.packages[FernRegistry.PackageId(params.subpackage)];
        }
        return parent;
    }, [api.packages, params.subpackage, parent]);

    if (package_ == null) {
        return <div>not found</div>;
    }

    return (
        <RoutesWith404>
            <Route path="/endpoints/:endpointId" element={<Endpoint package={package_} />} />
            <Route path="/types/:typeId" element={<div>type</div>} />
            <Route path="/:subpackage/*" element={<PackageRoutes api={api} parent={package_} />} />
        </RoutesWith404>
    );
};
