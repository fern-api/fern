pub use crate::prelude::*;

/// Query parameters for getWithAllowMultipleQuery
///
/// Request type for the GetWithAllowMultipleQueryQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetWithAllowMultipleQueryQueryRequest {
    #[serde(default)]
    pub query: Vec<String>,
    #[serde(default)]
    pub number: Vec<i64>,
}
