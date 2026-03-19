pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct GetBasicSolutionFileResponse2 {
    #[serde(rename = "solutionFileByLanguage")]
    #[serde(default)]
    pub solution_file_by_language: HashMap<Language, FileInfoV22>,
}
