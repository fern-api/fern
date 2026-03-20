pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Metadata {
    #[serde(default)]
    pub id: Id,
    pub value: serde_json::Value,
}