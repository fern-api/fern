use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum KeyType {
    #[serde(rename = "name")]
    Name,
    #[serde(rename = "value")]
    Value,
}
impl fmt::Display for KeyType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Name => "name",
            Self::Value => "value",
        };
        write!(f, "{}", s)
    }
}
