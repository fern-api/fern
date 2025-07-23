use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum SubmissionStatusV2 {
        Test {
            #[serde(flatten)]
            data: TestSubmissionStatusV2,
        },

        Workspace {
            #[serde(flatten)]
            data: WorkspaceSubmissionStatusV2,
        },
}
