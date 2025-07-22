use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum KeyType {
    #[serde(rename = "name")]
    Name,
    #[serde(rename = "value")]
    Value,
}