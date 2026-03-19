pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct DebugMapValue {
    #[serde(rename = "keyValuePairs")]
    #[serde(default)]
    pub key_value_pairs: Vec<Box<DebugKeyValuePairs>>,
}