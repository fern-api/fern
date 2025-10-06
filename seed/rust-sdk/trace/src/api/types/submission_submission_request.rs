pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum SubmissionSubmissionRequest {
    InitializeProblemRequest {
        #[serde(flatten)]
        data: SubmissionInitializeProblemRequest,
    },

    InitializeWorkspaceRequest,

    SubmitV2 {
        #[serde(flatten)]
        data: SubmissionSubmitRequestV2,
    },

    WorkspaceSubmit {
        #[serde(flatten)]
        data: SubmissionWorkspaceSubmitRequest,
    },

    Stop {
        #[serde(flatten)]
        data: SubmissionStopRequest,
    },
}
