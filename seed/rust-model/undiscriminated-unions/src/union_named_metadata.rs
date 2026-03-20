pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct NamedMetadata {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub value: HashMap<String, serde_json::Value>,
}