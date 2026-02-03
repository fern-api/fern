pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum SubmissionRequest {
        #[serde(rename = "initializeProblemRequest")]
        InitializeProblemRequest {
            #[serde(flatten)]
            data: InitializeProblemRequest,
        },

        #[serde(rename = "initializeWorkspaceRequest")]
        InitializeWorkspaceRequest,

        #[serde(rename = "submitV2")]
        SubmitV2 {
            #[serde(flatten)]
            data: SubmitRequestV2,
        },

        #[serde(rename = "workspaceSubmit")]
        WorkspaceSubmit {
            #[serde(flatten)]
            data: WorkspaceSubmitRequest,
        },

        #[serde(rename = "stop")]
        Stop {
            #[serde(flatten)]
            data: StopRequest,
        },
}
