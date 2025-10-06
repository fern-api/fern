pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ProblemFiles {
    #[serde(rename = "solutionFile")]
    pub solution_file: FileInfo,
    #[serde(rename = "readOnlyFiles")]
    pub read_only_files: Vec<FileInfo>,
}