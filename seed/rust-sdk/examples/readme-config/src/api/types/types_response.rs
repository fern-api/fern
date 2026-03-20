pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Response {
    pub response: serde_json::Value,
    #[serde(default)]
    pub identifiers: Vec<Identifier>,
}
