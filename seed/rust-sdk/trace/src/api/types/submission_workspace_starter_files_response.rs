pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct WorkspaceStarterFilesResponse {
    #[serde(default)]
    pub files: HashMap<Language, WorkspaceFiles>,
}