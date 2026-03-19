pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct MapValue {
    #[serde(rename = "keyValuePairs")]
    #[serde(default)]
    pub key_value_pairs: Vec<Box<KeyValuePair>>,
}
