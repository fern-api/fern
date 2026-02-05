pub use crate::prelude::*;

/// Request type for API operation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CreateRequest {
    pub decimal: f64,
    pub even: i64,
    pub name: String,
    pub shape: Shape,
}
