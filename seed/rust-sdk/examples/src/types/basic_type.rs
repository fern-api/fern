use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum BasicType {
    #[serde(rename = "primitive")]
    Primitive,
    #[serde(rename = "literal")]
    Literal,
}
impl fmt::Display for BasicType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Primitive => "primitive",
            Self::Literal => "literal",
        };
        write!(f, "{}", s)
    }
}
