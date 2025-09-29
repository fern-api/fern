use crate::commons_language::Language;
use crate::v_2_problem_function_implementation::FunctionImplementation;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FunctionImplementationForMultipleLanguages {
    #[serde(rename = "codeByLanguage")]
    pub code_by_language: HashMap<Language, FunctionImplementation>,
}