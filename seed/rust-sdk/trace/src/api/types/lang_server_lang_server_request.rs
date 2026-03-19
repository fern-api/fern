pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct LangServerRequest {
    pub request: serde_json::Value,
}
