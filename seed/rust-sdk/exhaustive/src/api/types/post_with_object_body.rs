pub use crate::prelude::*;

/// Request type for API operation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PostWithObjectBody {
    pub string: String,
    pub integer: i64,
    #[serde(rename = "NestedObject")]
    pub nested_object: ObjectWithOptionalField,
}
