pub use crate::prelude::*;

/// Request type for API operation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct FindRequest {
    #[serde(rename = "publicProperty")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub public_property: Option<String>,
    #[serde(rename = "privateProperty")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub private_property: Option<i64>,
    #[serde(rename = "optionalString")]
    pub optional_string: OptionalString,
}
