pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct NamedMetadata {
    pub name: String,
    pub value: HashMap<String, serde_json::Value>,
}