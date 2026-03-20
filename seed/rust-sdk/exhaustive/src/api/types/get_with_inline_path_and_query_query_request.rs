pub use crate::prelude::*;

/// Query parameters for getWithInlinePathAndQuery
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetWithInlinePathAndQueryQueryRequest {
    #[serde(default)]
    pub query: String,
}
