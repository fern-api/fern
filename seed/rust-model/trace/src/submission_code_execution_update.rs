pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum SubmissionCodeExecutionUpdate {
        BuildingExecutor {
            #[serde(flatten)]
            data: SubmissionBuildingExecutorResponse,
        },

        Running {
            #[serde(flatten)]
            data: SubmissionRunningResponse,
        },

        Errored {
            #[serde(flatten)]
            data: SubmissionErroredResponse,
        },

        Stopped {
            #[serde(flatten)]
            data: SubmissionStoppedResponse,
        },

        Graded {
            #[serde(flatten)]
            data: SubmissionGradedResponse,
        },

        GradedV2 {
            #[serde(flatten)]
            data: SubmissionGradedResponseV2,
        },

        WorkspaceRan {
            #[serde(flatten)]
            data: SubmissionWorkspaceRanResponse,
        },

        Recording {
            #[serde(flatten)]
            data: SubmissionRecordingResponseNotification,
        },

        Recorded {
            #[serde(flatten)]
            data: SubmissionRecordedResponseNotification,
        },

        InvalidRequest {
            #[serde(flatten)]
            data: SubmissionInvalidRequestResponse,
        },

        Finished {
            #[serde(flatten)]
            data: SubmissionFinishedResponse,
        },
}
