pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionWorkspaceStarterFilesResponse {
    pub files: HashMap<CommonsLanguage, SubmissionWorkspaceFiles>,
}
