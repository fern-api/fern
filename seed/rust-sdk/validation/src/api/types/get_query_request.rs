pub use crate::prelude::*;

/// Query parameters for get
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetQueryRequest {
    #[serde(default)]
    pub decimal: f64,
    #[serde(default)]
    pub even: i64,
    #[serde(default)]
    pub name: String,
}
