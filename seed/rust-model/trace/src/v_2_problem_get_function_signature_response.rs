pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetFunctionSignatureResponse {
    #[serde(rename = "functionByLanguage")]
    pub function_by_language: HashMap<Language, String>,
}