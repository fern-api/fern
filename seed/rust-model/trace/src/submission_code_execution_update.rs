use crate::submission_building_executor_response::BuildingExecutorResponse;
use crate::submission_running_response::RunningResponse;
use crate::submission_errored_response::ErroredResponse;
use crate::submission_stopped_response::StoppedResponse;
use crate::submission_graded_response::GradedResponse;
use crate::submission_graded_response_v_2::GradedResponseV2;
use crate::submission_workspace_ran_response::WorkspaceRanResponse;
use crate::submission_recording_response_notification::RecordingResponseNotification;
use crate::submission_recorded_response_notification::RecordedResponseNotification;
use crate::submission_invalid_request_response::InvalidRequestResponse;
use crate::submission_finished_response::FinishedResponse;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum CodeExecutionUpdate {
        BuildingExecutor {
            #[serde(flatten)]
            data: BuildingExecutorResponse,
        },

        Running {
            #[serde(flatten)]
            data: RunningResponse,
        },

        Errored {
            #[serde(flatten)]
            data: ErroredResponse,
        },

        Stopped {
            #[serde(flatten)]
            data: StoppedResponse,
        },

        Graded {
            #[serde(flatten)]
            data: GradedResponse,
        },

        GradedV2 {
            #[serde(flatten)]
            data: GradedResponseV2,
        },

        WorkspaceRan {
            #[serde(flatten)]
            data: WorkspaceRanResponse,
        },

        Recording {
            #[serde(flatten)]
            data: RecordingResponseNotification,
        },

        Recorded {
            #[serde(flatten)]
            data: RecordedResponseNotification,
        },

        InvalidRequest {
            #[serde(flatten)]
            data: InvalidRequestResponse,
        },

        Finished {
            #[serde(flatten)]
            data: FinishedResponse,
        },
}
