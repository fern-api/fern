pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionWorkspaceSubmissionStatusV2 {
    pub updates: Vec<SubmissionWorkspaceSubmissionUpdate>,
}