use crate::submission_workspace_submission_update::WorkspaceSubmissionUpdate;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceSubmissionStatusV2 {
    pub updates: Vec<WorkspaceSubmissionUpdate>,
}