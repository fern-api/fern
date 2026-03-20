pub use crate::prelude::*;

/// Request type for API operation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CreateRequest {
    #[serde(default)]
    pub decimal: f64,
    #[serde(default)]
    pub even: i64,
    #[serde(default)]
    pub name: String,
    pub shape: Shape,
}
