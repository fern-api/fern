pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum SubmissionSubmissionStatusV2 {
    Test {
        #[serde(flatten)]
        data: SubmissionTestSubmissionStatusV2,
    },

    Workspace {
        #[serde(flatten)]
        data: SubmissionWorkspaceSubmissionStatusV2,
    },
}
