use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WorkspaceSubmissionStatusV2 {
    pub updates: Vec<WorkspaceSubmissionUpdate>,
}