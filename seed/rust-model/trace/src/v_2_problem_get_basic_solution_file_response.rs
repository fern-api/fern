pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2ProblemGetBasicSolutionFileResponse {
    #[serde(rename = "solutionFileByLanguage")]
    pub solution_file_by_language: HashMap<Language, V2ProblemFileInfoV2>,
}