use crate::test_submission_status_v_2::TestSubmissionStatusV2;
use crate::workspace_submission_status_v_2::WorkspaceSubmissionStatusV2;
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
