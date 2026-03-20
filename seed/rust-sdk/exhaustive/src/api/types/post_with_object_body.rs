pub use crate::prelude::*;

/// Request type for API operation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PostWithObjectBody {
    #[serde(default)]
    pub string: String,
    #[serde(default)]
    pub integer: i64,
    #[serde(rename = "NestedObject")]
    #[serde(default)]
    pub nested_object: ObjectWithOptionalField,
}
