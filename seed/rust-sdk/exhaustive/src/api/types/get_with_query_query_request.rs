pub use crate::prelude::*;

/// Query parameters for getWithQuery
///
/// Request type for the GetWithQueryQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetWithQueryQueryRequest {
    #[serde(default)]
    pub query: String,
    #[serde(default)]
    pub number: i64,
}
