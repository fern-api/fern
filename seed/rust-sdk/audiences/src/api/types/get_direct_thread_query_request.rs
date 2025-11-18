pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetDirectThreadQueryRequest {
    pub ids: Vec<String>,
    pub tags: Vec<String>,
}
