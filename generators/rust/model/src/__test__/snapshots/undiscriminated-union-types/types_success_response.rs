pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TypesSuccessResponse {
    pub data: String,
    pub status: i64,
}