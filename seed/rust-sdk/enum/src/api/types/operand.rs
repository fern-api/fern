use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum Operand {
    #[serde(rename = ">")]
    GreaterThan,
    #[serde(rename = "=")]
    EqualTo,
    #[serde(rename = "less_than")]
    LessThan,
}
impl fmt::Display for Operand {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::GreaterThan => ">",
            Self::EqualTo => "=",
            Self::LessThan => "less_than",
        };
        write!(f, "{}", s)
    }
}
