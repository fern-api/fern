pub use crate::prelude::*;

/// Query parameters for getDirectThread
///
/// Request type for the GetDirectThreadQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetDirectThreadQueryRequest {
    pub ids: Vec<String>,
    pub tags: Vec<String>,
}
