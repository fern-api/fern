pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum SubmissionStatusV2 {
        #[serde(rename = "test")]
        Test {
            #[serde(flatten)]
            data: TestSubmissionStatusV2,
        },

        #[serde(rename = "workspace")]
        Workspace {
            #[serde(flatten)]
            data: WorkspaceSubmissionStatusV2,
        },
}
