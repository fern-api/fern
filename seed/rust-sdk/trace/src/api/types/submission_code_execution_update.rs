pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum CodeExecutionUpdate {
        #[serde(rename = "buildingExecutor")]
        BuildingExecutor {
            #[serde(flatten)]
            data: BuildingExecutorResponse,
        },

        #[serde(rename = "running")]
        Running {
            #[serde(flatten)]
            data: RunningResponse,
        },

        #[serde(rename = "errored")]
        Errored {
            #[serde(flatten)]
            data: ErroredResponse,
        },

        #[serde(rename = "stopped")]
        Stopped {
            #[serde(flatten)]
            data: StoppedResponse,
        },

        #[serde(rename = "graded")]
        Graded {
            #[serde(flatten)]
            data: GradedResponse,
        },

        #[serde(rename = "gradedV2")]
        GradedV2 {
            #[serde(flatten)]
            data: GradedResponseV2,
        },

        #[serde(rename = "workspaceRan")]
        WorkspaceRan {
            #[serde(flatten)]
            data: WorkspaceRanResponse,
        },

        #[serde(rename = "recording")]
        Recording {
            #[serde(flatten)]
            data: RecordingResponseNotification,
        },

        #[serde(rename = "recorded")]
        Recorded {
            #[serde(flatten)]
            data: RecordedResponseNotification,
        },

        #[serde(rename = "invalidRequest")]
        InvalidRequest {
            #[serde(flatten)]
            data: InvalidRequestResponse,
        },

        #[serde(rename = "finished")]
        Finished {
            #[serde(flatten)]
            data: FinishedResponse,
        },
}
