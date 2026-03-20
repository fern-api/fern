pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GenericValue {
    #[serde(rename = "stringifiedType")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stringified_type: Option<String>,
    #[serde(rename = "stringifiedValue")]
    #[serde(default)]
    pub stringified_value: String,
}