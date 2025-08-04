use crate::key_value_pair::KeyValuePair;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct MapValue {
    #[serde(rename = "keyValuePairs")]
    pub key_value_pairs: Vec<KeyValuePair>,
}