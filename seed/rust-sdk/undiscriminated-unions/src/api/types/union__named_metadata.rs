use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NamedMetadata {
    pub name: String,
    pub value: HashMap<String, serde_json::Value>,
}
