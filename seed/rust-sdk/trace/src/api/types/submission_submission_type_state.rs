pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum SubmissionTypeState {
        #[serde(rename = "test")]
        Test {
            #[serde(flatten)]
            data: TestSubmissionState,
        },

        #[serde(rename = "workspace")]
        Workspace {
            #[serde(flatten)]
            data: WorkspaceSubmissionState,
        },
}
