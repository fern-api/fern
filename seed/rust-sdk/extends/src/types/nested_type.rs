use crate::json::Json;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct NestedType {
    #[serde(flatten)]
    pub json_fields: Json,
    pub name: String,
}