use serde::{Deserialize, Serialize};
use crate::types::json::Json;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct NestedType {
    #[serde(flatten)]
    pub json_fields: Json,
    pub name: String,
}