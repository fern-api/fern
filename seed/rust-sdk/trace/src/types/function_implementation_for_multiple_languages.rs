use crate::language::Language;
use crate::function_implementation::FunctionImplementation;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct FunctionImplementationForMultipleLanguages {
    #[serde(rename = "codeByLanguage")]
    pub code_by_language: HashMap<Language, FunctionImplementation>,
}