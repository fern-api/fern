use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum PrimitiveValue {
    #[serde(rename = "STRING")]
    String,
    #[serde(rename = "NUMBER")]
    Number,
}
impl fmt::Display for PrimitiveValue {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::String => "STRING",
            Self::Number => "NUMBER",
        };
        write!(f, "{}", s)
    }
}
