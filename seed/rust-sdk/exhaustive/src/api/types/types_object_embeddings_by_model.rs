pub use crate::prelude::*;

/// An object where each property contains embedding arrays.
/// Similar to schemas that define both object properties and array items.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct EmbeddingsByModel {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub float: Option<Vec<Vec<f64>>>,
    #[serde(rename = "int8")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub int_8: Option<Vec<Vec<i64>>>,
    #[serde(rename = "uint8")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub uint_8: Option<Vec<Vec<i64>>>,
    #[serde(rename = "base64")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub base_64: Option<Vec<String>>,
}