use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SendResponse {
    pub message: String,
    pub status: i64,
    pub success: bool,
}
