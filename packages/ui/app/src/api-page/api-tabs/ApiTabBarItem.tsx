import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { matchPath } from "react-router-dom";
import { FernRoutes } from "../../routes";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { EndpointTitle } from "../definition/endpoints/EndpointTitle";
import { Tab } from "./context/ApiTabsContext";
import { useApiTabsContext } from "./context/useApiTabsContext";

export declare namespace ApiTabBarItem {
    export interface Props {
        tab: Tab;
    }
}

export const ApiTabBarItem: React.FC<ApiTabBarItem.Props> = ({ tab }) => {
    const { openTab, makeTabLongLived } = useApiTabsContext();

    const onClick = useMemo(
        () => (tab.isSelected ? undefined : () => openTab(tab.path)),
        [openTab, tab.isSelected, tab.path]
    );

    const onDoubleClick = useMemo(
        () => (tab.isEphemeral ? () => makeTabLongLived(tab.path) : undefined),
        [makeTabLongLived, tab.isEphemeral, tab.path]
    );

    const match = matchPath(FernRoutes.API_DEFINITION_PACKAGE.absolutePath, tab.path);
    const parsedPath = parsePath(match?.params["*"] ?? "");
    const { api, resolveSubpackage } = useApiDefinitionContext();
    const endpoint = useMemo(() => {
        if (parsedPath == null || api.type !== "loaded") {
            return undefined;
        }
        let package_: FernRegistry.ApiDefinitionPackage | undefined = api.value.rootPackage;
        for (const packageName of parsedPath.packagePath) {
            package_ = package_?.subpackages
                .map((subpackage) => resolveSubpackage(subpackage))
                .find((subpackage) => subpackage.name === packageName);
        }
        return package_?.endpoints.find((endpoint) => endpoint.id === parsedPath.endpointId);
    }, [api, parsedPath, resolveSubpackage]);

    if (endpoint == null) {
        return <div>TODO unknown tab</div>;
    }

    return (
        <div
            key={tab.path}
            style={{
                fontStyle: tab.isEphemeral ? "italic" : undefined,
                color: tab.isSelected ? "red" : undefined,
            }}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
        >
            <EndpointTitle endpoint={endpoint} />
        </div>
    );
};

const ENDPOINT_REGEX = /(.+\/)*endpoint\/(.+)/;
// const TYPE_REGEX = /(.+\/)*type\/(.+)/;

type ParsedPath = ParsedEndpointPath;

interface ParsedEndpointPath {
    type: "endpoint";
    packagePath: string[];
    endpointId: string;
}

function parsePath(path: string): ParsedPath | undefined {
    return parseEndpointPath(path);
}

function parseEndpointPath(path: string): ParsedEndpointPath | undefined {
    const match = path.match(ENDPOINT_REGEX);
    if (match == null) {
        return undefined;
    }
    const [_, packagePath = "", endpointId] = match;

    if (endpointId == null) {
        return undefined;
    }

    return {
        type: "endpoint",
        packagePath: packagePath.split("/").filter((part) => part.length > 0),
        endpointId,
    };
}
