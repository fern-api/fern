use crate::identifier::Identifier;
use serde_json::Value;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Response {
    pub response: serde_json::Value,
    pub identifiers: Vec<Identifier>,
}