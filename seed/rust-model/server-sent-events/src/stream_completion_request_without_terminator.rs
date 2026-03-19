pub use crate::prelude::*;

/// Request type for API operation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct StreamCompletionRequestWithoutTerminator {
    #[serde(default)]
    pub query: String,
}
