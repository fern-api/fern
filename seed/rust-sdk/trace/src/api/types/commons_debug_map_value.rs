use crate::commons_debug_key_value_pairs::DebugKeyValuePairs;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DebugMapValue {
    #[serde(rename = "keyValuePairs")]
    pub key_value_pairs: Vec<DebugKeyValuePairs>,
}
