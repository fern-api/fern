use crate::language::Language;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UnexpectedLanguageError {
    #[serde(rename = "expectedLanguage")]
    pub expected_language: Language,
    #[serde(rename = "actualLanguage")]
    pub actual_language: Language,
}