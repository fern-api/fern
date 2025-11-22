pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetWithAllowMultipleQueryQueryRequest {
    pub query: Vec<String>,
    pub number: Vec<i64>,
}
