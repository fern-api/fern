use crate::test_submission_state::TestSubmissionState;
use crate::workspace_submission_state::WorkspaceSubmissionState;
use serde::{Deserialize, Serialize};

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
