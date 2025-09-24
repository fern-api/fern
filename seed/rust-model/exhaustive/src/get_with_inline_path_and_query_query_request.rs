use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetWithInlinePathAndQueryQueryRequest {
    pub query: String,
}