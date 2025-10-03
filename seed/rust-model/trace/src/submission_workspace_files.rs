pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WorkspaceFiles {
    #[serde(rename = "mainFile")]
    pub main_file: FileInfo,
    #[serde(rename = "readOnlyFiles")]
    pub read_only_files: Vec<FileInfo>,
}