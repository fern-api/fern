pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WorkspaceStarterFilesResponse {
    pub files: HashMap<Language, WorkspaceFiles>,
}