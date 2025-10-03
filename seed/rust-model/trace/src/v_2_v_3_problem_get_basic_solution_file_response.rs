pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3ProblemGetBasicSolutionFileResponse {
    #[serde(rename = "solutionFileByLanguage")]
    pub solution_file_by_language: HashMap<Language, V2V3ProblemFileInfoV2>,
}
