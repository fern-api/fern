use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetWithAllowMultipleQueryQueryRequest {
    pub query: String,
    pub number: i64,
}