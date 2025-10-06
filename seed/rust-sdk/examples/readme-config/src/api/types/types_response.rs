pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TypesResponse {
    pub response: serde_json::Value,
    pub identifiers: Vec<Identifier>,
}
