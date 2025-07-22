use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ComplexType {
    #[serde(rename = "object")]
    Object,
    #[serde(rename = "union")]
    Union,
    #[serde(rename = "unknown")]
    Unknown,
}