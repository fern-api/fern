pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WorkspaceStarterFilesResponseV2 {
    #[serde(rename = "filesByLanguage")]
    pub files_by_language: HashMap<Language, Files>,
}