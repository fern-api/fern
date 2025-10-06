pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct LangServerLangServerResponse {
    pub response: serde_json::Value,
}
