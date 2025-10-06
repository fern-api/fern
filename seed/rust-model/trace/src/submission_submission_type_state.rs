pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum SubmissionSubmissionTypeState {
        Test {
            #[serde(flatten)]
            data: SubmissionTestSubmissionState,
        },

        Workspace {
            #[serde(flatten)]
            data: SubmissionWorkspaceSubmissionState,
        },
}
