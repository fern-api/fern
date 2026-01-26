pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct LangServerRequest {
    pub request: serde_json::Value,
}