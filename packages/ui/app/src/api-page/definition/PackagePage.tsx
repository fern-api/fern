import { RoutesWith404 } from "@fern-api/routing-utils";
import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { Route, useMatch, useParams } from "react-router-dom";

export declare namespace PackagePage {
    export interface Props {
        api: FernRegistry.ApiDefinition;
        parent: FernRegistry.ApiDefinitionPackage;
    }
}

export const PackagePage: React.FC<PackagePage.Props> = ({ api, parent }) => {
    const params = useParams();
    console.log("match", useMatch("/:apiId/definition/:environment/*"));
    console.log("rendering", params);

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
            <Route path="/endpoints/:endpointId" element={<div>endpoint</div>} />
            <Route path="/types/:typeId" element={<div>type</div>} />
            <Route path="/:subpackage/*" element={<PackagePage api={api} parent={package_} />} />
        </RoutesWith404>
    );
};
