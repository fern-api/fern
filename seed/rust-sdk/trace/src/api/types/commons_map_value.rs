pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct MapValue {
    #[serde(rename = "keyValuePairs")]
    pub key_value_pairs: Vec<Box<KeyValuePair>>,
}
