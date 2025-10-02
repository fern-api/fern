use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct NamedMetadata {
    pub name: String,
    pub value: HashMap<String, serde_json::Value>,
}