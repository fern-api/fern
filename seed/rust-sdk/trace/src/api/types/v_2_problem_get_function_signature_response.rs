pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2ProblemGetFunctionSignatureResponse {
    #[serde(rename = "functionByLanguage")]
    pub function_by_language: HashMap<Language, String>,
}
