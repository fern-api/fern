pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct GetFunctionSignatureResponse2 {
    #[serde(rename = "functionByLanguage")]
    #[serde(default)]
    pub function_by_language: HashMap<Language, String>,
}
