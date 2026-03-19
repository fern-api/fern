pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SendResponse {
    #[serde(default)]
    pub message: String,
    #[serde(default)]
    pub status: i64,
    pub success: bool,
}
