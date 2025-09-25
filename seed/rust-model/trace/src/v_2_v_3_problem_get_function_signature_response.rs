use crate::commons_language::Language;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetFunctionSignatureResponse {
    #[serde(rename = "functionByLanguage")]
    pub function_by_language: HashMap<Language, String>,
}