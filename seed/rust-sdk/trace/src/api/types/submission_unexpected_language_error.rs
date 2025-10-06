pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionUnexpectedLanguageError {
    #[serde(rename = "expectedLanguage")]
    pub expected_language: CommonsLanguage,
    #[serde(rename = "actualLanguage")]
    pub actual_language: CommonsLanguage,
}
