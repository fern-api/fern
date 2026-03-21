pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SuccessResponse {
    #[serde(default)]
    pub data: String,
    #[serde(default)]
    pub status: i64,
}