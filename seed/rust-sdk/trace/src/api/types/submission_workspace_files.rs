pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionWorkspaceFiles {
    #[serde(rename = "mainFile")]
    pub main_file: CommonsFileInfo,
    #[serde(rename = "readOnlyFiles")]
    pub read_only_files: Vec<CommonsFileInfo>,
}
