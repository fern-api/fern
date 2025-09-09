use crate::commons_file_info::FileInfo;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct WorkspaceFiles {
    #[serde(rename = "mainFile")]
    pub main_file: FileInfo,
    #[serde(rename = "readOnlyFiles")]
    pub read_only_files: Vec<FileInfo>,
}