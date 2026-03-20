pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct FunctionImplementationForMultipleLanguages2 {
    #[serde(rename = "codeByLanguage")]
    #[serde(default)]
    pub code_by_language: HashMap<Language, FunctionImplementation2>,
}