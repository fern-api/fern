pub use crate::prelude::*;

/// Query parameters for list
///
/// Request type for the ListQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ListQueryRequest {
    pub limit: i64,
}
