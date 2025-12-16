pub use crate::prelude::*;

/// Query parameters for getWithInlinePathAndQuery
///
/// Request type for the GetWithInlinePathAndQueryQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetWithInlinePathAndQueryQueryRequest {
    pub query: String,
}
