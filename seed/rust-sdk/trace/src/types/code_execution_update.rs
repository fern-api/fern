use crate::building_executor_response::BuildingExecutorResponse;
use crate::running_response::RunningResponse;
use crate::errored_response::ErroredResponse;
use crate::stopped_response::StoppedResponse;
use crate::graded_response::GradedResponse;
use crate::graded_response_v_2::GradedResponseV2;
use crate::workspace_ran_response::WorkspaceRanResponse;
use crate::recording_response_notification::RecordingResponseNotification;
use crate::recorded_response_notification::RecordedResponseNotification;
use crate::invalid_request_response::InvalidRequestResponse;
use crate::finished_response::FinishedResponse;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
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
