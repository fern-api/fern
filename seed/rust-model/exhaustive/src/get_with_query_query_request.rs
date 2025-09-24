use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetWithQueryQueryRequest {
    pub query: String,
    pub number: i32,
}