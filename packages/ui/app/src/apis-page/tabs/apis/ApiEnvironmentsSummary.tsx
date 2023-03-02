import { NonIdealState } from "@blueprintjs/core";
import { FernRegistry } from "@fern-fern/registry";
import { isEmpty } from "lodash-es";
import React from "react";
import { useAllEnvironments } from "../../../queries/useAllEnvironments";
import { ApiEnvironmentRow } from "./ApiEnvironmentRow";

export declare namespace ApiEnvironmentsSummary {
    export interface Props {
        apiMetadata: FernRegistry.ApiMetadata;
    }
}

export const ApiEnvironmentsSummary: React.FC<ApiEnvironmentsSummary.Props> = ({ apiMetadata }) => {
    const allEnvironments = useAllEnvironments();

    if (allEnvironments.type !== "loaded") {
        return null;
    }

    if (apiMetadata.environments == null || isEmpty(apiMetadata.environments)) {
        return <NonIdealState>No deployment information</NonIdealState>;
    }

    return (
        <div className="flex-1 flex flex-col">
            <div className="grid grid-cols-[20%_1fr] gap-x-10 gap-y-1.5 mt-4 ml-4">
                <div className="text-stone-500 uppercase text-xs">Environment</div>
                <div className="text-stone-500 uppercase text-xs">Deployed</div>
                {allEnvironments.value.environments.map((environment) => {
                    const deploymentInfo = apiMetadata.environments?.[environment.id];
                    if (deploymentInfo == null) {
                        return null;
                    }
                    return (
                        <ApiEnvironmentRow
                            key={environment.id}
                            apiMetadata={apiMetadata}
                            environment={environment}
                            deploymentInfo={deploymentInfo}
                        />
                    );
                })}
            </div>
        </div>
    );
};
