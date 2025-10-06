pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct FileDirectoryDirectory {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub files: Option<Vec<FileFile>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub directories: Option<Vec<FileDirectoryDirectory>>,
}