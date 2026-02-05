pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WorkspaceSubmissionState {
    pub status: WorkspaceSubmissionStatus,
}