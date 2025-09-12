use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GenericValue {
    #[serde(rename = "stringifiedType")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stringified_type: Option<String>,
    #[serde(rename = "stringifiedValue")]
    pub stringified_value: String,
}