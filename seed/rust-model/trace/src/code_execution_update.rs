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
