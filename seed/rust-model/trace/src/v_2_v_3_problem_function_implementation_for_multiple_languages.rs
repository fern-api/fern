pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct FunctionImplementationForMultipleLanguages2 {
    #[serde(rename = "codeByLanguage")]
    pub code_by_language: HashMap<Language, FunctionImplementation2>,
}