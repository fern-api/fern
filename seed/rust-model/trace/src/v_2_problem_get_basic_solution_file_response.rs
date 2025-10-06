pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetBasicSolutionFileResponse {
    #[serde(rename = "solutionFileByLanguage")]
    pub solution_file_by_language: HashMap<Language, FileInfoV2>,
}