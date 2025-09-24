use crate::submission_workspace_submission_status::WorkspaceSubmissionStatus;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceSubmissionState {
    pub status: WorkspaceSubmissionStatus,
}
