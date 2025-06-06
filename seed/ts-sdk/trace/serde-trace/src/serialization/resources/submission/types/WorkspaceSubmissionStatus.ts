/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index.js";
import * as SeedTrace from "../../../../api/index.js";
import * as core from "../../../../core/index.js";
import { ErrorInfo } from "./ErrorInfo.js";
import { RunningSubmissionState } from "./RunningSubmissionState.js";
import { WorkspaceRunDetails } from "./WorkspaceRunDetails.js";

export const WorkspaceSubmissionStatus: core.serialization.Schema<
    serializers.WorkspaceSubmissionStatus.Raw,
    SeedTrace.WorkspaceSubmissionStatus
> = core.serialization
    .union("type", {
        stopped: core.serialization.object({}),
        errored: core.serialization.object({
            value: ErrorInfo,
        }),
        running: core.serialization.object({
            value: RunningSubmissionState,
        }),
        ran: WorkspaceRunDetails,
        traced: WorkspaceRunDetails,
    })
    .transform<SeedTrace.WorkspaceSubmissionStatus>({
        transform: (value) => value,
        untransform: (value) => value,
    });

export declare namespace WorkspaceSubmissionStatus {
    export type Raw =
        | WorkspaceSubmissionStatus.Stopped
        | WorkspaceSubmissionStatus.Errored
        | WorkspaceSubmissionStatus.Running
        | WorkspaceSubmissionStatus.Ran
        | WorkspaceSubmissionStatus.Traced;

    export interface Stopped {
        type: "stopped";
    }

    export interface Errored {
        type: "errored";
        value: ErrorInfo.Raw;
    }

    export interface Running {
        type: "running";
        value: RunningSubmissionState.Raw;
    }

    export interface Ran extends WorkspaceRunDetails.Raw {
        type: "ran";
    }

    export interface Traced extends WorkspaceRunDetails.Raw {
        type: "traced";
    }
}
