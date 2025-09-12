use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct OptionalMetadata(pub Option<HashMap<String, serde_json::Value>>);