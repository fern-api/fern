use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ComplexType {
    #[serde(rename = "object")]
    Object,
    #[serde(rename = "union")]
    Union,
    #[serde(rename = "unknown")]
    Unknown,
}
impl fmt::Display for ComplexType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Object => "object",
            Self::Union => "union",
            Self::Unknown => "unknown",
        };
        write!(f, "{}", s)
    }
}
