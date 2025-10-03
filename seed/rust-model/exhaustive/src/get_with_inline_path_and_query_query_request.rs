pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetWithInlinePathAndQueryQueryRequest {
    pub query: String,
}

