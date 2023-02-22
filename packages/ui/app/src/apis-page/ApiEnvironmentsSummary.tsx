import { PopoverPosition } from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";
import { TwoColumnTable, TwoColumnTableRow } from "@fern-api/common-components";
import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { generatePath, Link } from "react-router-dom";
import { DefinitionRoutes } from "../api-page/routes";
import { useAllEnvironments } from "../queries/useAllEnvironments";
import { ApiCardLinkWrapper } from "./ApiCardLinkWrapper";

export declare namespace ApiEnvironmentsSummary {
    export interface Props {
        api: FernRegistry.LightweightApi;
    }
}

export const ApiEnvironmentsSummary: React.FC<ApiEnvironmentsSummary.Props> = ({ api }) => {
    const allEnvironments = useAllEnvironments();

    const environmentsInOrder = useMemo(() => {
        if (allEnvironments.type !== "loaded") {
            return undefined;
        }
        return allEnvironments.value.environments.filter((environment) => api.deployments.has(environment.id));
    }, [allEnvironments, api.deployments]);

    if (environmentsInOrder == null || environmentsInOrder.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col">
            <div className="text-stone-500 uppercase text-xs">Environments</div>
            <div className="flex flex-col ml-2 mt-3">
                <TwoColumnTable className="gap-x-10 gap-y-1.5">
                    {environmentsInOrder.map((environment) => (
                        <TwoColumnTableRow
                            key={environment.id}
                            label={
                                <ApiCardLinkWrapper>
                                    <Link
                                        className="underline hover:underline underline-offset-2"
                                        to={generatePath(DefinitionRoutes.API_ENVIRONMENT.absolutePath, {
                                            API_ID: api.id,
                                            ENVIRONMENT_ID: environment.id,
                                        })}
                                    >
                                        {environment.displayName}
                                    </Link>
                                </ApiCardLinkWrapper>
                            }
                        >
                            <Tooltip2 position={PopoverPosition.RIGHT} content="2023-02-22T01:42:22Z">
                                Deployed 2 hours ago
                            </Tooltip2>
                        </TwoColumnTableRow>
                    ))}
                </TwoColumnTable>
            </div>
        </div>
    );
};
