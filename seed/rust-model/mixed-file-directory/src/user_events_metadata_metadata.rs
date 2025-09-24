use crate::id::Id;
use serde_json::Value;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Metadata {
    pub id: Id,
    pub value: serde_json::Value,
}