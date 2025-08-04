use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ReservedKeywordEnum {
    #[serde(rename = "is")]
    Is,
    #[serde(rename = "as")]
    As,
}