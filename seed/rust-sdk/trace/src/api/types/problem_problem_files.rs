pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ProblemProblemFiles {
    #[serde(rename = "solutionFile")]
    pub solution_file: CommonsFileInfo,
    #[serde(rename = "readOnlyFiles")]
    pub read_only_files: Vec<CommonsFileInfo>,
}
