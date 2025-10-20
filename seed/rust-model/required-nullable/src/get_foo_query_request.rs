pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetFooQueryRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_baz: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_nullable_baz: Option<Option<String>>,
    pub required_baz: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub required_nullable_baz: Option<String>,
}
