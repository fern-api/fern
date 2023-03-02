import { PopoverPosition } from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";
import { FernRegistry } from "@fern-fern/registry";
import { formatDistance } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import React, { useMemo } from "react";
import { generatePath, Link } from "react-router-dom";
import { DefinitionRoutes } from "../../../api-page/routes";

export declare namespace ApiEnvironmentRow {
    export interface Props {
        apiMetadata: FernRegistry.ApiMetadata;
        environment: FernRegistry.Environment;
        deploymentInfo: FernRegistry.DeploymentInfo;
    }
}

export const ApiEnvironmentRow: React.FC<ApiEnvironmentRow.Props> = ({ apiMetadata, environment, deploymentInfo }) => {
    const relativeTimestamp = useMemo(
        () => formatDistance(deploymentInfo.registrationTime, new Date(), { addSuffix: true }),
        [deploymentInfo.registrationTime]
    );

    const absoluteTimestamp = useMemo(
        () =>
            formatInTimeZone(
                deploymentInfo.registrationTime,
                Intl.DateTimeFormat().resolvedOptions().timeZone,
                "MMM d, yyyy, h:mm a z"
            ),
        [deploymentInfo.registrationTime]
    );

    return (
        <>
            <Link
                className="hover:underline underline-offset-2"
                to={generatePath(DefinitionRoutes.API_ENVIRONMENT.absolutePath, {
                    API_ID: apiMetadata.id,
                    ENVIRONMENT_ID: environment.id,
                    ORGANIZATION_ID: "todo",
                })}
            >
                {environment.name}
            </Link>
            <div className="flex">
                <Tooltip2 position={PopoverPosition.RIGHT} content={absoluteTimestamp}>
                    {relativeTimestamp}
                </Tooltip2>
            </div>
        </>
    );
};
