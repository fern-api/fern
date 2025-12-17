pub use crate::prelude::*;

/// This schema has nullable:true at the top level.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct NullableObject {
    #[serde(rename = "nullableField")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nullable_field: Option<String>,
}