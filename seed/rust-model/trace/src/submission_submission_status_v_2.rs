use crate::submission_test_submission_status_v_2::TestSubmissionStatusV2;
use crate::submission_workspace_submission_status_v_2::WorkspaceSubmissionStatusV2;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
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
