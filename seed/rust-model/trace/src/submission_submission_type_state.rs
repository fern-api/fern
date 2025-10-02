pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum SubmissionTypeState {
        Test {
            #[serde(flatten)]
            data: TestSubmissionState,
        },

        Workspace {
            #[serde(flatten)]
            data: WorkspaceSubmissionState,
        },
}
