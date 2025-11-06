pub use crate::prelude::*;

/// Query parameters for get
///
/// Request type for the GetQueryRequest operation.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetQueryRequest {
    pub decimal: f64,
    pub even: i64,
    pub name: String,
}
