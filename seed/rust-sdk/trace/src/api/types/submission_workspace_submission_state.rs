pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionWorkspaceSubmissionState {
    pub status: SubmissionWorkspaceSubmissionStatus,
}
