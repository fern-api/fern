pub use crate::prelude::*;

/// Request type for API operation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct InlinedChildRequest {
    #[serde(default)]
    pub child: String,
    #[serde(default)]
    pub parent: String,
}
