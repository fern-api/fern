pub use crate::prelude::*;

/// Query parameters for getWithPathAndQuery
///
/// Request type for the GetWithPathAndQueryQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetWithPathAndQueryQueryRequest {
    pub query: String,
}
