pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct LangServerLangServerRequest {
    pub request: serde_json::Value,
}