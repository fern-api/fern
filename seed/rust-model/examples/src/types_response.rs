use crate::identifier::Identifier;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Response {
    pub response: serde_json::Value,
    pub identifiers: Vec<Identifier>,
}