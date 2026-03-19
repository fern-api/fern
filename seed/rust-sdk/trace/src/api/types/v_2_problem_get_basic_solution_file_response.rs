pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct GetBasicSolutionFileResponse {
    #[serde(rename = "solutionFileByLanguage")]
    #[serde(default)]
    pub solution_file_by_language: HashMap<Language, FileInfoV2>,
}
