pub use crate::prelude::*;

/// Request type for API operation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct OptionalMergePatchRequest {
    #[serde(rename = "requiredField")]
    pub required_field: String,
    #[serde(rename = "optionalString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_string: Option<String>,
    #[serde(rename = "optionalInteger")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_integer: Option<i64>,
    #[serde(rename = "optionalBoolean")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_boolean: Option<bool>,
    #[serde(rename = "nullableString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_string: Option<String>,
}
