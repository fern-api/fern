use crate::commons_key_value_pair::KeyValuePair;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MapValue {
    #[serde(rename = "keyValuePairs")]
    pub key_value_pairs: Vec<KeyValuePair>,
}