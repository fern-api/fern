pub use crate::prelude::*;

/// Query parameters for getWithPathAndQuery
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetWithPathAndQueryQueryRequest {
    #[serde(default)]
    pub query: String,
}
