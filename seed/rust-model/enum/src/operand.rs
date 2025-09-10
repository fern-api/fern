use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Operand {
    #[serde(rename = ">")]
    GreaterThan,
    #[serde(rename = "=")]
    EqualTo,
    #[serde(rename = "less_than")]
    LessThan,
}