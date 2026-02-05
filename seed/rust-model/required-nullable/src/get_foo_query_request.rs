pub use crate::prelude::*;

/// Query parameters for getFoo
///
/// Request type for the GetFooQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetFooQueryRequest {
    /// An optional baz
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_baz: Option<String>,
    /// An optional baz
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_nullable_baz: Option<Option<String>>,
    /// A required baz
    pub required_baz: String,
    /// A required baz
    #[serde(skip_serializing_if = "Option::is_none")]
    pub required_nullable_baz: Option<String>,
}
