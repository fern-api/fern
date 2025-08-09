use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ReservedKeywordEnum {
    #[serde(rename = "is")]
    Is,
    #[serde(rename = "as")]
    As,
}
impl fmt::Display for ReservedKeywordEnum {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Is => "is",
            Self::As => "as",
        };
        write!(f, "{}", s)
    }
}
