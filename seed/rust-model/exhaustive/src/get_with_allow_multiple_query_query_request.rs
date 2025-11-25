pub use crate::prelude::*;

/// Query parameters for getWithAllowMultipleQuery
///
/// Request type for the GetWithAllowMultipleQueryQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetWithAllowMultipleQueryQueryRequest {
    pub query: Vec<String>,
    pub number: Vec<i64>,
}
