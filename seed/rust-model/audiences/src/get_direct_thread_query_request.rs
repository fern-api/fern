pub use crate::prelude::*;

/// Query parameters for getDirectThread
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetDirectThreadQueryRequest {
    #[serde(default)]
    pub ids: Vec<String>,
    #[serde(default)]
    pub tags: Vec<String>,
}
