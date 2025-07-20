use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct FunctionImplementationForMultipleLanguages {
    #[serde(rename = "codeByLanguage")]
    pub code_by_language: HashMap<Language, FunctionImplementation>,
}