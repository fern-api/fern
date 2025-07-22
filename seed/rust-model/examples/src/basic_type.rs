use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum BasicType {
    #[serde(rename = "primitive")]
    Primitive,
    #[serde(rename = "literal")]
    Literal,
}