use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DebugMapValue {
    #[serde(rename = "keyValuePairs")]
    pub key_value_pairs: Vec<DebugKeyValuePairs>,
}