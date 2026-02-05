pub use crate::prelude::*;

/// Request type for API operation
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct RegularPatchRequest {
    #[serde(rename = "field1")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub field_1: Option<String>,
    #[serde(rename = "field2")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub field_2: Option<i64>,
}
