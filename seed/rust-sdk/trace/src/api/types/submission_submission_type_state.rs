use crate::submission_test_submission_state::TestSubmissionState;
use crate::submission_workspace_submission_state::WorkspaceSubmissionState;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
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
