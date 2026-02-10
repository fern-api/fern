pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Response {
    pub response: serde_json::Value,
    pub identifiers: Vec<Identifier>,
}