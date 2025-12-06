pub use crate::prelude::*;

/// Query parameters for getWithQuery
///
/// Request type for the GetWithQueryQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetWithQueryQueryRequest {
    pub query: String,
    pub number: i64,
}
