use crate::workspace_submission_status::WorkspaceSubmissionStatus;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WorkspaceSubmissionState {
    pub status: WorkspaceSubmissionStatus,
}