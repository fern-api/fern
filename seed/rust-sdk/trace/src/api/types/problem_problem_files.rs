pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ProblemFiles {
    #[serde(rename = "solutionFile")]
    #[serde(default)]
    pub solution_file: FileInfo,
    #[serde(rename = "readOnlyFiles")]
    #[serde(default)]
    pub read_only_files: Vec<FileInfo>,
}
