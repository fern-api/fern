pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct WorkspaceFiles {
    #[serde(rename = "mainFile")]
    #[serde(default)]
    pub main_file: FileInfo,
    #[serde(rename = "readOnlyFiles")]
    #[serde(default)]
    pub read_only_files: Vec<FileInfo>,
}
