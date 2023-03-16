import { PopoverPosition } from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";
import { FernRegistry } from "@fern-fern/registry";
import { formatDistance } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import React, { useMemo } from "react";

export declare namespace ApiEnvironmentRow {
    export interface Props {
        environment: FernRegistry.Environment;
        deploymentInfo: FernRegistry.DeploymentInfo;
    }
}

export const ApiEnvironmentRow: React.FC<ApiEnvironmentRow.Props> = ({ environment, deploymentInfo }) => {
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
            <div>{environment.id}</div>
            <div className="flex">
                <Tooltip2 position={PopoverPosition.RIGHT} content={absoluteTimestamp}>
                    {relativeTimestamp}
                </Tooltip2>
            </div>
        </>
    );
};
