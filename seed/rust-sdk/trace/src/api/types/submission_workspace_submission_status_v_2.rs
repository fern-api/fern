pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct WorkspaceSubmissionStatusV2 {
    #[serde(default)]
    pub updates: Vec<WorkspaceSubmissionUpdate>,
}
