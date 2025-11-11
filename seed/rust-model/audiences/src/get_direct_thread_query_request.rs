pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetDirectThreadQueryRequest {
    pub ids: String,
    pub tags: String,
}
